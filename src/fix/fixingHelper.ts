export const extractArguments = (issueCode: string, issueElement: any): Array<string> => {
    if (issueCode === "dead_link") {
        return issueElement.arguments.map((arg: any) => {
            return arg.$Ref.remove("content/");
        })
    }
    return [];
}