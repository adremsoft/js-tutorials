import {html} from "lit-html";
import {Note} from "../services/note-list.js";
import {DynamicTemplate, handleEvent} from "../common/dynamic-template.js";


//type ExtendedProperties<T> = P in keyof T;

class EditForm extends DynamicTemplate {
    private data: Note | null = null;

    @handleEvent()
    onUpdate() {
        this.detach();
        return this.data;
    }

    @handleEvent()
    onDelete() {
        this.detach();
        return this.data?.id;
    }

    update(prop: keyof Note) {
        return (e: any) => (<any>this.data)[prop] = e.target.value
    }

    edit(data: Note | null) {
        this.data = data;
        this.attach();
    }

    html() {
        const data = this.data;
        if (data == null) {
            return html``;
        }
        // language=HTML
        return html`
        <label for="subject">
            Subject:<input type="text" id="subject" .value=${data.subject} @input=${this.update('subject')}>
        </label>
        <label for="content">
            Content:<textarea id="content" .value=${data.content} @input=${this.update('content')} ></textarea>
        </label>
        <label for="content">
            Category: 
            <select id="category" .value=${data.category} @input=${this.update('category')}>
                <option>Important</option>
                <option>Normal</option>
                <option>Disabled</option>
            </select>
        </label>
        <a href="#" class="btn btn-add" @click=${this.onUpdate}>Save</a>
        <a href="#" class="btn-close" @click=${this.detach.bind(this)}>&times;</a>
        <a href="#" class="btn-delete" @click="${this.onDelete}">Delete</a>`
    }
}

export const editForm = new EditForm(document.body, 'new-note');
