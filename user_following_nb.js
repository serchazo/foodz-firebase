'user-strict';

exports.handler = function(userId,followingId,change,database){
  const followingNbRef = database.ref('user-following-nb');

  // Get the position delta
  const followingFlag = change.after.val();

  // We add a like, except when the flag is null and we subtract a like
  var followingToAdd = 1;
  if (followingFlag == null){
    followingToAdd = -1;
  }

  // Use transactions to update the newValue
  // Use transaction - concurrent modifications possible
  return followingNbRef.child(userId).transaction(function(nbFollowing){
    if(nbFollowing == null){
      var nullValueToWrite = followingToAdd;
      if (followingToAdd<0){ nullValueToWrite = 0;}
      //console.log("Null execution, setting value to: "+ nullValueToWrite);
      return nullValueToWrite;
    }else{
      var newValue = (nbFollowing || 0) + followingToAdd;
      if (newValue<0) {newValue = 0;}
      //console.log("Updated value: "+newValue);
      return newValue;
    }
  });

};
