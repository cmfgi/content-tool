 export type IssueResponse = {
    hits:IssueData
}

export type IssueData = {
    $Refs:Array<string>;
    prefix:string;
}