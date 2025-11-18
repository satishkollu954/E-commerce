import { LightningElement,api } from 'lwc';

export default class Child extends LightningElement {
    @api message;
    @api
    get messageName(){
        return this.message;
    }
    set messageName(value){
        this.message=value.toUpperCase();
    }
}