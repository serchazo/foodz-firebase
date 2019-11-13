'user-strict';


exports.handler = function(userId,database){
  const userFollowingDBRef = database.ref('user-following'); // more complicated
  const userFollowersDBRef = database.ref('user-followers');

  const updateObject = {};

  // 1. Get the users that this user is following
  return userFollowingDBRef.child(userId).once('value', function(snapshot){
    //[START] verify if the user is following someone
    if (snapshot.exists()){
      const userKeysAsArray = Object.keys(snapshot.val());
      //Delete from the followers
      userKeysAsArray.forEach( key => {
        updateObject['user-followers/'+key+'/'+userId]=null;
      });

      updateObject['user-following/'+userId]=null;

      return database.ref().update(updateObject);
    } //[END] Verify if the user is following someone
    return null;
  });
};
