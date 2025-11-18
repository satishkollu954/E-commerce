trigger AccountTriggerc on Account (before update) {
    AccountHandlercls.handleBeforeUpdate(Trigger.new, Trigger.oldMap);

}