  /*
This function recalculates the points of a restaurant every time a user ranking is Updated,
whether is Add, Update, Remove.  We rely on Google's functions stuff
*/
'use-strict';

exports.handler = function(userId,countryId,stateId,cityId,foodId,restoId,change,database){
  const userRankingDetailRef = database.ref('user-ranking-points');
  const userPointsMultiplierRef = database.ref('user-pointsmultiplier');

  var positionBefore = change.before.val();
  var positionAfter = change.after.val();

  // Get the multiplier for the user
  return userPointsMultiplierRef.child(userId).once('value', function(snapshot){
    var multiplier = 10;
    if (snapshot.exists()){
      snapshot.val();
    }

    // Points to add
    var pointsToAdd = 0;
    if (positionAfter != null){
      var positionMultiple = 10 - positionAfter + 1;
      // Correct for the positions higher than 10
      if (positionMultiple < 0) {positionMultiple =1;}
      //write points
      pointsToAdd = Math.ceil(multiplier * positionMultiple * 0.1);
    }

    // Points to subtract
    pointsToSubtract = 0;
    if (positionBefore != null){
      var positionMultipleBefore = 10 - positionBefore +1 ;
      if (positionMultipleBefore < 0){ positionMultipleBefore = 1; }
      pointsToSubtract = Math.ceil(multiplier * positionMultipleBefore*0.1);
    }

    // Total points to modify
    const pointsToWrite = pointsToAdd - pointsToSubtract;

    const pointsPath = userId+'/'+countryId+'/'+stateId+'/'+cityId+'/'+foodId+'/'+restoId +'/points';
    // Use transaction - concurrent modifications possible
    return userRankingDetailRef.child(pointsPath).transaction(function(restoPoints){
      if(restoPoints == null){
        var nullValueToWrite = pointsToWrite;
        if (pointsToWrite<0){ nullValueToWrite = 0;}
        //console.log("Null execution, setting value to: "+ nullValueToWrite);
        return nullValueToWrite;
      }else{
        var newValue = (restoPoints || 0) + pointsToWrite;
        if (newValue<0) {newValue = 0;}
        //console.log("Updated value: "+newValue);
        return newValue;
      }
    });
  });
};
