//var ElizaBot = require("./elizabot");
//var ebot = new ElizaBot();
exports.getWidget = function(feather, cb) {
  var chatChannel = feather.socket.addChannel({
    id: "blog:chat",
    announceConnections: true, //tell all connected clients when a new client joins
    messages: ["chat"], //defining a messages array limits what messages are allowed
    /*hooks : {
    message: function(args, cb) {      
      var dataReturn = {
        message: ebot.transform(args.data.message),
        name: "eliza",
        remote: false
      };
      cb(null,args.data);  //must pass a callback no matter what to propogate to all clients
      if(args.client !== this.channelClient) {
        if (args.message == "chat") {
        this.sendMessage("chat",dataReturn);
        }           
      }
    }*/ 
  });
  cb(null, {
    name: "blog.chat",
    path: "widgets/chat/"
  });
}