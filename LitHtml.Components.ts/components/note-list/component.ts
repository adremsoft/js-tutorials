import {BaseComponent, ComponentEvents, EventHandler, html, repeat} from "../../scripts/html-components.js";
import {Note, NoteList} from "../../notes/notes-list.js";


export interface NoteListEvents extends ComponentEvents {
    onEdit: EventHandler
}

class NoteListComponent extends BaseComponent {
    notes: NoteList | null;
    searchText = '';

    constructor(notes: NoteList, events: NoteListEvents) {
        super(events);
        this.notes = notes;
        this.el = document.body.appendChild(document.createElement('div'));
    }

    search(text: string) {
        this.searchText = text.toLowerCase();
        this.update();
    }

    filter(note: Note): boolean {
        return Object.values(note).filter(v => typeof v === 'string').map(v => v.toLowerCase()).some((v) => v.includes(this.searchText));
    }

    render() {
        const list = (this.notes || []).filter(note => this.searchText === '' || this.filter(note));
        //language=HTML
        return html`
           <ul class="notes"> 
                ${repeat(list, (n: Note) => n.id, (n: Note) => html`
                <li @click=${(e: Event) => this.event(e, 'onEdit', n)} class=${n.category.toLowerCase()}>
                    <h2>${n.subject}</h2>
                    <h3>${n.category}</h3>
                    <p>${n.content}</p>                                   
                </li>`)}
            </ul>            
          </div>`;
    }
}

export {NoteListComponent};
