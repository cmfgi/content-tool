export const extractArguments = (issueCode: string, issueElement: any): Array<string> => {
    if (issueCode === "dead_link") {
        return issueElement.arguments.map((arg: any) => {
            return removeContentPrefix(arg.$Ref);
        })
    }
    return [];
}

export const extractIngestReferences = (refItem: any, property: string): Array<any> => {
    if ((refItem.data.properties[property].references as Array<any>).length > 0) {
        return refItem.data.properties[property].references;
    }
    return [];
}

export const removeContentPrefix = (str: string) => {
    return str.replace("content/", "");
}