trigger OpportunityTrigger on Opportunity (before insert) {
    if(Trigger.isBefore&& Trigger.isInsert){
OpportunityHandler.recordTypeFilteration(Trigger.New);


}

}