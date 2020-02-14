import {BaseComponent, html, repeat} from "../../scripts/html-components.js";


class NotesComponent extends BaseComponent {
    constructor(notes, events) {
        super(events);
        this.notes = notes;
        this.searchText = '';
        this.el = document.body.appendChild(document.createElement('div'));
    }

    search(text) {
        this.searchText = text.toLowerCase();
        this.update();
    }

    filter(note) {
        return Object.values(note).filter(v => typeof v === 'string').map(v => v.toLowerCase()).some((v) => v.includes(this.searchText));
    }

    render() {
        const list = (this.notes || []).filter(note => this.searchText === '' || this.filter(note));

        //language=HTML
        return html`
           <ul class="notes"> 
                ${repeat(list, (n) => n.id, n => html`
                <li @click=${(e) => this.event(e, 'onEdit', n)} class=${n.category.toLowerCase()}>
                    <h2>${n.subject}</h2>
                    <h3>${n.category}</h3>
                    <p>${n.content}</p>                                   
                </li>`)}
            </ul>            
          </div>`;
    }
}

export {NotesComponent};
