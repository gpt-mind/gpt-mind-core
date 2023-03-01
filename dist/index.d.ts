export declare class Mind {
    config: any;
    stateMap: any;
    bindings: any;
    agents: any;
    sources: any;
    start: any;
    events: any;
    constructor(config: any);
    /**
     * add an event listener
     * @param event the event to listen for
     * @param callback  the callback to call when the event is emitted
     */
    on(event: string, callback: (event: string, output: string) => void): void;
    /**
     * add an event listener that is only called once
     * @param event the event to listen for
     * @param callback the callback to call when the event is emitted
     */
    once(event: string, callback: (event: string, output: string) => void): void;
    /**
     * remove an event listener
     * @param event the event to remove the listener from
     * @param callback the callback to remove
     * @returns void
     */
    off(event: string, callback: (event: string, output: string) => void): void;
    /**
     * emit an event
     * @param event the event to emit
     * @param output the output to pass to the callback
     */
    emit(event: string, output: any): void;
    /**
     * input a query into the mind
     * @param agent the agent to input the query into
     * @param query the query to input
     */
    input(agent: string, query: string): Promise<void>;
    /**
     * run the mind
     * @param agent the agent to run
     */
    run(agent: string): Promise<void>;
}
