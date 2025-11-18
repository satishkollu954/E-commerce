public with sharing class AccountHandlercls {
    public handleBeforeUpdate(List<Account> newAcc,Map<Id,Account> oldAccMap) {
        for(Account acc:newAcc){
          if(acc.Phone!=oldAccMap.get(acc.Id).Phone){
              acc.Description='Phone Number Changed';
          }

        }
    }
}



