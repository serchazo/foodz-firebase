'user-strict';

exports.handler = function(userId,database){
  const updateObject = {};

  updateObject['user-followers/'+userId]=null;
  updateObject['user-followers-nb/'+userId]=null;
  updateObject['user-following-nb/'+userId]=null;
  updateObject['user-pointsmultiplier/'+userId]=null;
  updateObject['user-ranking-detail/'+userId]=null;
  updateObject['user-ranking-geography/'+userId]=null;
  updateObject['user-rankings/'+userId]=null;
  updateObject['user-timeline/'+userId]=null;

  updateObject['user-todelete/'+userId]=true;

  database.ref('user-todelete').child(userId).set('true');

  // The atomic commit
  return database.ref().update(updateObject);

};
