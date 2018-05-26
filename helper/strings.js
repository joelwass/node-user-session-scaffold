module.exports = {
  // generic
  invalidParameters: 'Invalid parameters passed in',
  anErrorHappened: 'Something went wrong',

  // user
  invalidPasswordParameter: 'Password must be greater than 5 characters long',
  userAlreadyExists: 'A user already exists with this email',
  userCreatedSuccesfully: 'New user created succesfully',
  noUserExistingByThatEmail: 'No user exists by that email',
  userUpdatedSuccesfully: 'The user was updated succesfully',
  userSuccessfullyDeleted: 'The user was succesfully deleted',

  // recommendation
  noFromUserByThatId: 'Invalid id for a recommendation to be made from',
  noToUserByThatId: 'You can\'t make a recommendation for a user by that id',
  recommendationCreatedSuccesfully: 'Recommendation was created succesfully',
  noRecommendationForThatId: 'No recommendation exists with that id',
  recommendationUpdatedSuccesfully: 'The recommendation was updated successfully',
  recommendationSuccesfullyDeleted: 'The recommendation was succesfully deleted',
  noRecommendationForThatUserId: 'No recommendation exists for that user id',
  noRecommendationFromThatUserId: 'No recommendation exists from that user id',
  noRecommendationsReturned: 'No recommendations exist',

  // auth
  sorryWeCantFindEmail: 'Username or password was incorrect',
  passwordInvalid: 'Username or password was incorrect',
  unauthorizedRequest: 'Invalid auth token sent down',
  expiredSessionId: 'Auth token has expired'
}
