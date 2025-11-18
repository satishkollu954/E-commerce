
public with sharing class OpportunityHandler {
     public static void recordTypeFilteration(List<Opportunity> oppNew) {
        if (oppNew.isEmpty()) return;

        
        Set<Id> recordTypeIds = new Set<Id>();
        for (Opportunity opp : oppNew) {
         if(opp.Id!=null){
            recordTypeIds.add(opp.RecordType.Id);
         }
        }
        console.log('Record Type Ids: ' + recordTypeIds);

            Map<Id, RecordType> recordTypeMap = new Map<Id, RecordType>(
            [SELECT Id, DeveloperName FROM RecordType WHERE SObjectType = 'Opportunity' and Id IN :recordTypeIds]
        );

   

        for (Opportunity opp : oppNew) {
           String rname = recordTypeMap.get(opp.RecordTypeId).DeveloperName;

            if (rname == 'Corporate Sale' && opp.Discount__c > 10) {
                opp.addError('You cannot make discount value greater than 10%');
            } 
            else if (rname == 'Government Sale') {
                opp.Payment_Terms__c = 'Net 60';
            } 
            else if (rname == 'Partner Sale' && opp.Partner_Account__c == null) {
                opp.addError('Partner_Account__c field is mandatory and it should not be blank');
            }
        }
    }
}