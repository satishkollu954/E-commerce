import { LightningElement ,wire,api} from 'lwc';
import {getRecord,getFieldValue} from 'lightning/uiRecordApi';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';

export default class DemoLwc extends LightningElement {
    @api recordId

    @wire(getRecord,{recordId:'$recordId',fields:[NAME_FIELD,PHONE_FIELD]})
    record;

    get name(){
        return getFieldValue(this.record.data,NAME_FIELD);
    }

    get phone(){
        return getFieldValue(this.record.data,PHONE_FIELD);
    }

}