export class Note {

    public remote: boolean = false;
    public local: boolean = false;
    public _id: any;
    public name: string;
    public content: string;
    public localFilePath: string;
    public history: NoteDiff[] = [];
    public contentHashCode: string;
    public showHistory: boolean = false;
}

export class NoteDiff {

    constructor(patch: any, date: Date) {
        this.creationDate = date;
        this.diff = patch;
    }

    public diff: any;
    public creationDate: Date;
    public parent: Note;
}