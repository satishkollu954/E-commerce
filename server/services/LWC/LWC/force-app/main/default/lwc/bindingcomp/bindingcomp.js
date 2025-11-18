import { LightningElement } from 'lwc';

export default class Bindingcomp extends LightningElement {
    greeting="Kavya";
    handleChange(event){
        this.greeting=event.target.value;
    }
}