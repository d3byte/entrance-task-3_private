const GraphQLDate = require('graphql-date');

const query = require('./query');
const mutation = require('./mutation');

module.exports = function resolvers () {
  return {
    Query: query,

    Mutation: mutation,

    Event: {
      room(event) {
        return event.getRoom();
      },
      users (event) {
        return event.getUsers();
      },
    },

    Date: GraphQLDate
  };
};
