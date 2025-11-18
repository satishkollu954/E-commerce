public with sharing class ContactHandler {
    @AuraEnabled(cacheable=true)
    public static List<Contact> contactHandlerMethod(String accId) {
        return [SELECT Id, FirstName, LastName, Email 
                FROM Contact 
                WHERE AccountId = :accId
                With SECURITY_ENFORCED];

    }
}