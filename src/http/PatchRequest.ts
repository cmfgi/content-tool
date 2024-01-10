export default class PatchRequest {

     path: string | undefined;

     type: string | undefined;

     properties: any = {};

    public setUuid(uid: string) {

    }

    public setPath(p: string) {
        this.path = p;
    }

    public setType(t: string) {
        this.type = t;
    }

    public addLinkProperty(property: string, value: Array<any>) {
        this.properties[property] = {
            references: value || [],
            type: "Linklist"
        }
    }
}