/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */

/*
// this is this configuration for the mind - this describes how the mind works
// destinations are agents, or output, anything else ends up in the state map (internal ends up in the state map)]
// all responses are stored in the state map
// all request variables are grabbed from the state map
// getPromptDefinition is used to return prompt definitions and call openai
{
    "stateMap": {},
    "bindings": {
        "input": ["agent1"],
        "agent1": ['agent2'],
        "agent2": ['agent3'],
        "agent3": ['output', 'agent4'],
        "agent4": ["internal"],
        ["internal"]: ['canVisualize', 'think']
        "canVisualize": ["visualize"],
        "visualize": ["internal"]
        "output": []
    },
    "agents": {
        "agent1": "generate a description of the statement \"{{input}}\"",
        "agent2": "generate a response to the statement \"{{agent1}}\"",
        "agent3": "generate a response given statements \"{{agent1}}\"\nand statements \"{{agent2}}\"",
        "agent4": "generate a response free of social mind to the statement \"{{agent1,agent2}}\"",
        "canVisualize": "is there visualizable imagery in the statement \"{{agent1,agent2}}\"",
        "visualize": "generate a detailed description of the imagery in the statement \"{{agent1,agent2}}\"",
    },
    start: {

    },
    sources: {
        "agent1": (agent, query, options) => agent.complete(query, options),
        "agent2": (agent, query, options) => agent.complete(query, options),
        "agent3": (agent, query, options) => agent.complete(query, options),
        "agent4": (agent, query, options) => agent.complete(query, options),
        "canVisualize": (agent, query, options) => agent.complete(query, options),
        "visualize": (agent, query, options) => Automatic111.txt2img(query, "", { steps: 20 }),
        "think": (agent, query, options) => agent.complete(query, options),
    }
}
*/

export class Mind {
    stateMap: any
    bindings: any
    agents: any
    sources: any
    start: any
    events: any
    constructor(public config: any) {
        this.events = {};
        this.run = this.run.bind(this);
        this.stateMap = config.stateMap;
        this.bindings = config.bindings;
        this.sources = config.sources;
        this.agents = Object.keys(config.agents).map((key) => ({ key, value: this.config.getPromptDefinition ? this.config.getPromptDefinition(config.agents[key]) : config.agents[key] }));
        this.start = config.start;
        if (this.start) {
            const keys = Object.keys(this.start);
            keys.forEach((key) => this.input(key, this.start[key]));
        }
    }

    /**
     * add an event listener
     * @param event the event to listen for
     * @param callback  the callback to call when the event is emitted
     */
    public on(event: string, callback: (event: string, output: string) => void) {
        if (!this.events[event]) { this.events[event] = [] }
        this.events[event].push(callback);
    }

    /**
     * add an event listener that is only called once
     * @param event the event to listen for
     * @param callback the callback to call when the event is emitted
     */
    public once(event: string, callback: (event: string, output: string) => void) {
        const cb = (output: string) => { this.off(event, cb); callback(event, output) };
        this.on(event, cb);
    }

    /**
     * remove an event listener
     * @param event the event to remove the listener from
     * @param callback the callback to remove
     * @returns void
     */
    public off(event: string, callback: (event: string, output: string) => void) {
        if (!this.events[event]) { return; }
        this.events[event] = this.events[event].filter((cb: (output: string) => void) => cb !== callback);
    }

    /**
     * emit an event
     * @param event the event to emit
     * @param output the output to pass to the callback
     */
    public emit(event: string, output: any) {
        if (this.events[event]) this.events[event].forEach((cb: (event: string, output: any) => void) => cb(event, output));
        if (event.endsWith('*')) {
            const tevent = event.substring(0, event.length - 1);
            const events = Object.keys(this.events).filter((key) => key.startsWith(tevent));
            events.forEach((key) => this.events[key].forEach((cb: (event: string, output: any) => void) => cb(event, output)));
        }
        if (this.events['*']) this.events['*'].forEach((cb: (event: string, output: any) => void) => cb(event, output));
    }

    /**
     * input a query into the mind
     * @param agent the agent to input the query into
     * @param query the query to input
     */
    public async input(agent: string, query: string) {
        this.stateMap.input = query;
        this.stateMap[agent] = query;
        await this.run(agent);
    }

    /**
     * run the mind
     * @param agent the agent to run
     */
    public async run(agent: string) {
        // get the output bindings
        const bindings = this.bindings[agent];
        if (!bindings) { throw new Error(`No bindings for agent ${agent}`); }
        for (const binding of bindings) {
            const agent = this.agents.find(async ({ key, }: any) => key === binding);
            if (agent) {
                this.emit(`before_${binding}`, this);
                if (this.sources[binding]) {
                    this.stateMap[binding] = await this.sources[binding](agent.value, this.stateMap);
                } else {
                    throw new Error(`No source for agent ${binding}`);
                }
                this.emit(`after_${binding}`, this);
                this.run(binding);
            }
            else {
                if (binding !== "") {
                    this.stateMap[binding] = this.stateMap[agent]
                    this.emit(`after_${binding}`, this);
                    this.run(binding);
                }
            }
        }
    }
}