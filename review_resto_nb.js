'user-strict';

exports.handler = function(userId,countryId,stateId,cityId,foodId,restoId,restoName,message,database){
  // Define the variables first
  const restoReviewsNBDBRef = database.ref('resto-points');

  // We add a like, except when the flag is null and we subtract a like
  var reviewsToAdd = 0;
  if (message && message.sanitized){
    reviewsToAdd = 1;
  }else if (message == null){
    reviewsToAdd = -1;
  }

  if(reviewsToAdd != 0){
    // Use transactions to update the newValue
    // Use transaction - concurrent modifications possible
    let restoDbPath = countryId + '/' + stateId + '/' + cityId + '/' + foodId + '/' + restoId +'/reviews';
    return restoReviewsNBDBRef.child(restoDbPath).transaction(function(nbReviews){
      if(nbReviews == null){
        var nullValueToWrite = reviewsToAdd;
        if (reviewsToAdd<0){ nullValueToWrite = 0;}
        //console.log("Null execution, setting value to: "+ nullValueToWrite);
        return nullValueToWrite;
      }else{
        var newValue = (nbReviews || 0) + reviewsToAdd;
        if (newValue<0) {newValue = 0;}
        //console.log("Updated value: "+newValue);
        return newValue;
      }
    });

  }
  return null;
};
