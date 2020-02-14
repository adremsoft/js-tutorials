export interface ListEvents {
    onChanged?: (list: ObservableList<any>) => void
}

export class ObservableListElement {
    id = -1;
}

export class ObservableList<Element extends ObservableListElement> extends Array {
    events: ListEvents = {};
    lastId = 0;

    constructor(events = {}) {
        super();
        this.events = events;
    }

    changed() {
        if (typeof this.events.onChanged === 'function') {
            this.events.onChanged(this);
        }
    }

    get nextId() {
        this.lastId += 1;
        return this.lastId;
    }

    new(): ObservableListElement {
        return new ObservableListElement();
    }

    delete(note: Element) {
        const ix = this.findIndex(n => n.id === note.id);
        if (ix >= 0) {
            this.splice(ix, 1);
        }
        this.changed();
    }

    update(note: Element) {
        if (note.id === -1) {
            note.id = this.nextId;
            this.push(note);
        } else {
            const ix = this.findIndex(n => n.id === note.id);
            this[ix] = note;
        }
        this.changed();
    }

    load(data: []) {
        this.length = 0;
        this.push(...data);
        this.lastId = this.reduce((pv, v) => v.id > pv ? v.id : pv, 0);
        this.changed();
    }
}
