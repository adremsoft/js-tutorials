(function () {
    "use strict";

    const
        NEW_FORM_DATA = {
            subject: '',
            content: '',
            category: 'Normal'
        };

    class Component {
        constructor(def) {
            const el = document.createElement('div');
            el.innerHTML = def.template;
            Object.assign(this, def);
            this.el = document.querySelector(def.bindTo || 'body').appendChild(el.children[0]);
            Component.bind(this, this.el);
        }

        static bind(model, el) {
            el.querySelectorAll('[bind]').forEach(e => {
                const [event, method] = e.getAttribute('bind').split(':');
                e.removeAttribute('bind');
                e.addEventListener(event, (e) => (model[method](e), false));
            });
        }
    }

    function isChildOf(c, p) {
        do {
            c = c.parentNode;
        } while (c !== p && c != null);
        return c != null;
    }

    const notes = {
        notes: [],
        el: document.querySelector('.notes'),
        noteEditForm: new Component({
            // language=HTML
            template: `
                <div id="new-note" class="hidden">
                    <label for="subject">
                        Subject:<input type="text" id="subject">
                    </label>
                    <label for="content">
                        Content:<textarea id="content"></textarea>
                    </label>
                    <label for="content">
                        Category:
                        <select id="category">
                            <option>Important</option>
                            <option>Normal</option>
                            <option>Disabled</option>
                        </select>
                    </label>
                    <a href="#" class="btn btn-add" bind="click:saveNote">Save</a>
                    <a href="#" class="btn-close" bind="click:hide">&times;</a>
                    <a href="#" class="btn-delete" bind="click:deleteNote">Delete</a>
                </div>
            `,
            fields: Object.keys(NEW_FORM_DATA),
            getData() {
                return Object.assign(this.data, this.fields.map(id => ({id, el: document.getElementById(id)}))
                    .filter(e => e.el != null)
                    .reduce((pe, e) => (pe[e.id] = e.el.value, pe), {}));
            },

            saveNote(e) {
                this.hide();
                notes.onSaveNote(this.getData());
                e.stopPropagation();
            },

            deleteNote(e) {
                notes.onDeleteNote(this.data.id);
                this.hide();
            },

            hide() {
                this.el.classList.add('hidden');
            },

            edit(data) {
                this.data = data || Object.assign({id: notes.nextId}, NEW_FORM_DATA);
                this.fields.map(id => ({id, el: document.getElementById(id)}))
                    .filter(e => e.el != null)
                    .forEach(e => e.el.value = this.data[e.id]);
                this.el.classList.remove('hidden');
                this.el.scrollIntoView();
            },
        }),
        search: '',
        get nextId() {
            this.lastId += 1;
            return this.lastId;
        },
        init() {
            Component.bind(this, document);
            this.load().render();
        },
        onBodyClick(e) {
            if (e.target !== this.noteEditForm.el && !isChildOf(e.target, this.noteEditForm.el)) {
                this.noteEditForm.hide();
            }
        },
        onSearchInput(e) {
            this.search = (e.target.value || '').toLowerCase();
            this.render();
        },
        onSaveNote(data) {
            if (this.notes.find(rec => rec.id === data.id) == null) {
                this.notes.push(this.noteEditForm.getData());
            }
            this.save().render();
        },
        onDeleteNote(id) {
            const ix = this.notes.findIndex(rec => rec.id === id);
            if (ix >= 0) {
                this.notes.splice(ix, 1);
                this.render();
            }
        },
        edit(data) {
            this.noteEditForm.edit(data);
        },
        add(e) {
            this.noteEditForm.edit();
            e.stopPropagation();
        },
        filter(note) {
            return Object.values(note).filter(v => typeof v === 'string').some(v => v.toLowerCase().includes(this.search));
        },
        render() {
            this.el.innerHTML = '';
            this.notes
                .filter(note => this.search === '' || this.filter(note))
                .map(note => {
                    const
                        {category, subject, content} = note,
                        li = document.createElement('li');
                    li.classList.add(category.toLowerCase(), 'note');
                    li.addEventListener('click', (e) => (this.edit(note), e.stopPropagation()));
                    li.innerHTML = `
                            <h2>${subject}</h2>
                            <h3>${category}</h3>
                            <p>${content}</p>`;
                    return li;
                })
                .forEach(li => this.el.append(li))
        },
        load() {
            this.notes = JSON.parse(localStorage.getItem('notes') || "[]");
            this.lastId = this.notes.reduce((maxId, e) => e.id > maxId ? e.id : maxId, 0);
            return this;
        },
        save() {
            localStorage.setItem('notes', JSON.stringify(this.notes));
            return this;
        }
    };

    notes.init();
})();
