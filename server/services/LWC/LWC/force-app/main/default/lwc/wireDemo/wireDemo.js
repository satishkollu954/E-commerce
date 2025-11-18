import { LightningElement,wire,api } from 'lwc';
import getContacts from '@salesforce/apex/ContactHandler.contactHandlerMethod';
import { getRecord } from 'lightning/uiRecordApi';

export default class WireDemo extends LightningElement {
    @api recordId;
    @wire (getContacts,{accId:'$recordId'})
    contacts;

    @wire(getRecord, { recordId: '$recordId', fields: ['Account.Name'] })
        account;
    get name() {
        return this.account.data ? this.account.data.fields.Name.value : '';
    }
}