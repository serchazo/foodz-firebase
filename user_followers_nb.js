'user-strict';

exports.handler = function(userId,targetId,change,database){
  const followersNBRef = database.ref('user-followers-nb');

  // Get the position delta
  const followersFlag = change.after.val();

  // We add a like, except when the flag is null and we subtract a like
  var followersToAdd = 1;
  if (followersFlag == null){
    followersToAdd = -1;
  }

  // Use transactions to update the newValue
  // Use transaction - concurrent modifications possible
  return followersNBRef.child(targetId).transaction(function(nbFollowers){
    if(nbFollowers == null){
      var nullValueToWrite = followersToAdd;
      if (followersToAdd<0){ nullValueToWrite = 0;}
      //console.log("Null execution, setting value to: "+ nullValueToWrite);
      return nullValueToWrite;
    }else{
      var newValue = (nbFollowers || 0) + followersToAdd;
      if (newValue<0) {newValue = 0;}
      //console.log("Updated value: "+newValue);
      return newValue;
    }
  });

};
