"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = require("jquery");
require('nc-input-library');
const ncCategory = $('#category').NCInput({
    design: {
        title: 'Category Management'
    },
    table: {
        ui: [
            { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
            { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
            { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true },
            { id: 'description', desc: 'Description', dataTable: true, input: 'text' },
            { id: 'name', desc: 'name', dataTable: true, input: 'text' },
        ],
        conf: {
            order: [['lastModified', 'desc'], ['firstName', 'asc']],
            getURL: `${window['rootHash']}/categories`,
            onRowClicked: onCategoryClicked,
            numColumn: 3
        }
    },
    buttons: {
        ui: [
            { id: 'add', desc: 'Add', postTo: `${window['rootHash']}/category` },
            { id: 'edit', desc: 'Edit', postTo: `${window['rootHash']}/category/edit` },
            { id: 'delete', desc: 'Delete', postTo: `${window['rootHash']}/category/delete` }
        ],
        conf: {
            networkTimeout: 2000 // timeout for postTo request
        }
    }
});
const ncSubCategory = $('#sub-category').NCInput({
    design: {
        title: 'Sub-Category Management'
    },
    table: {
        ui: [
            { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
            { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
            { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true },
            { id: 'description', desc: 'Description', dataTable: true, input: 'text' },
            { id: 'name', desc: 'name', dataTable: true, input: 'text' },
        ],
        conf: {
            order: [['lastModified', 'desc'], ['firstName', 'asc']],
            getURL: `${window['rootHash']}/subCategories`,
            onRowClicked: onSubCategoryClicked,
            numColumn: 3
        }
    },
    buttons: {
        ui: [
            { id: 'add', desc: 'Add', postTo: `${window['rootHash']}/subCategory` },
            { id: 'edit', desc: 'Edit', postTo: `${window['rootHash']}/subCategory/edit` },
            { id: 'delete', desc: 'Delete', postTo: `${window['rootHash']}/subCategory/delete` }
        ],
        conf: {
            networkTimeout: 2000 // timeout for postTo request
        }
    }
});
var selectedCategory;
function onCategoryClicked(data) {
    selectedCategory = data;
    console.log('Selected category=' + JSON.stringify(selectedCategory));
}
function onSubCategoryClicked(data) {
}
