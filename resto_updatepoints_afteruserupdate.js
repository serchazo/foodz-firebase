// We need to update the points based on the delta points of the user

'use-strict';

exports.handler = function(userId,countryId,stateId,cityId,foodId,restoId,change,database){
  const restoPointsRef = database.ref('resto-points');

  var pointsBefore = change.before.val();
  var pointsAfter = change.after.val();

  // Points to add
  var pointsToAdd = 0;
  if (pointsAfter != null){
    pointsToAdd = pointsAfter;
  }

  // Points to subtract
  pointsToSubtract = 0;
  if (pointsBefore != null){
    pointsToSubtract = pointsBefore;
  }

  // Total points to modify
  const pointsToWrite = pointsToAdd - pointsToSubtract;

  const pointsPath = countryId+'/'+stateId+'/'+cityId+'/'+foodId+'/'+restoId +'/points';

  // Use transaction - concurrent modifications possible
  return restoPointsRef.child(pointsPath).transaction(function(restoPoints){
    if(restoPoints == null){
      var nullValueToWrite = pointsToWrite;
      if (pointsToWrite<0){ nullValueToWrite = 0;}
      //console.log("Null execution, setting value to: "+ nullValueToWrite);
      return nullValueToWrite;
    }else{
      var newValue = (restoPoints || 0) + pointsToWrite;
      if (newValue<0) {newValue = 0;}
      console.log("Updated value for resto : "+restoId+":"+newValue);
      return newValue;
    }
  });
};
