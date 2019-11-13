'user-strict';

/*
  Delete user reviews.  Same trigger as the other delete functions
*/

exports.handler = function(userId,database){
  const userReviews = database.ref('user-reviews');
  const userReviewsList = database.ref('user-reviews-list');
  const restoReviews = database.ref('resto-reviews');

const updateObject = {};

// 1. Get the user userReviews
return userReviewsList.child(userId).once('value', function(snapshot){
  snapshot.forEach(function(childSnapshot) {
    const countryKey = childSnapshot.key;
    // Go to state level
    childSnapshot.forEach(function(stateSnap){
      const stateKey = stateSnap.key ;
      // Go to city level
      stateSnap.forEach(function(citySnap){
        const cityKey = citySnap.key;
        // Go to food level
        citySnap.forEach(function(foodSnap){
          const foodKey = foodSnap.key;
          // Go to resto level
          foodSnap.forEach(function(restoSnap){
            const restoId = restoSnap.key;
            // Then delete the review at resto level
            const restoDbPath = countryKey +'/' + stateKey + '/'+ cityKey + '/'+ restoId + '/' + userId ;
            updateObject['resto-reviews/'+restoDbPath]=null;
          });//restoSnap
        });//food
      }); //city
    });//state
  }); // country

  // Then, delete the user stuff
  updateObject['user-reviews/'+userId]=null;
  updateObject['user-reviews-list/'+userId]=null;
  // The atomic commit
  return database.ref().update(updateObject);
});
};
