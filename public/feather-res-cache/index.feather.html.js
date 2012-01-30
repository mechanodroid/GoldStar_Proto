

/* ========== engine.client.js ========== */

feather.ns("blog");

(function() {
  
  blog.engine = feather.Widget.create({
    name : "blog.engine",
    path : "widgets/engine/",
    prototype: {
      checkUser: function() {
        var me = this;
        if (feather.auth.user && (feather.auth.user.hasAnyAuthority(['admin', 'editor']))) {
          me.toolbar.addButton({ name: 'new', tooltip: 'New Blog Post', after:'refresh' });
        }
      },
      onReady: function(args){
        var me = this;
        me.checkUser();
        /*me.toolbar.on("refresh", function() {
          me.latestposts.refreshPosts();
        });
        me.toolbar.on("new", function() {
          me.editPost();
        });
        me.latestposts.on("editPost", function(args) {
          me.editPost(args.post);
        });
        feather.auth.api.on('authenticated', function() {
          me.checkUser();
        });
        feather.auth.api.on('loggedOut', function() {
          me.toolbar.removeButton({name:'new'});
        });*/
      },
      editPost: function(post) {
        var me = this;
        var id = feather.id();
        var title = post == null ? "New Post" : post.parent_id != null ? "Reply to Post" : "Edit Post";
        feather.Widget.load({
          id: id,
          path: "widgets/editpost/",
          clientOptions: {
            model: {post: post},
            containerOptions: {
              title: title,
              width: 800,
              height: 350,
              modal: true,
              buttons: {
                SAVE: function() {
                  var w = feather.Widget.widgets.findById(id);
                  w.savePost(function(err) {
                    if (!err) {
                      w.dispose();
                      me.latestposts.refreshPosts();
                    }
                  });
                },
                Cancel: function() {
                  var w = feather.Widget.widgets.findById(id);
                  w.dispose();
                }
              }
            }
          }
        });
      }
    }
  });
})();


/* ========== header.client.js ========== */

feather.ns("blog");
(function() { 

  blog.header = feather.Widget.create({
    name: "blog.header",
    path: "widgets/header/"
  });
  
})();




/* ========== signin.client.js ========== */

feather.ns("blog");
(function() {

  blog.signin = feather.Widget.create({
    name: "blog.signin",    
    path: "widgets/signin/",      
    prototype: {
      onReady: function(args) {
        var me = this;
        
        //feather.logger.info({message:'inside onReady of signin1.',category:'achievements.api'});

                        /**
         * create an FSM to handle ui states
         */
        var fsm = new feather.FiniteStateMachine({
          states: {
            initial: {
              stateStartup: function() {

          //              feather.logger.info({message:'inside onReady of signin2.',category:'achievements.api'});
                if (me.get("#signoutBtn").length) {
                  return this.states.loggedIn;
                }
                return this.states.loggedOut;
              }
            },
            loggedIn: {
              stateStartup: function() {
                var fsm = this;
                if (!me.get("#signoutBtn").length) {
                  me.get("#signInPanel").html("");
                  $.tmpl(me.templates.signedIn, {}).appendTo(me.get("#signInPanel"));
                }
                //wire the signInHandler
                me.signOutHandler = me.domEvents.bind(me.get("#signoutBtn"), "click", function() {
                  feather.auth.api.logout(function(err) {
                    if (!err) {
                      fsm.fire("loggedOut");
                    } else {
                      //var addOn = "dummy";
                      //err.append(addOn);
                      me.get('#message').empty().append(err);
                    }
                  });                  
                });
              },
              loggedOut: function() {
                return this.states.loggedOut;
              },
              leavingState: function() {
                me.signOutHandler.unbind();
                me.signOutHandler = null;
              }
            }, //end loggedIn state
            loggedOut: {
              stateStartup: function() {
            //            feather.logger.info({message:'inside onReady of signin3.',category:'achievements.api'});
                var fsm = this;
                if (!me.get(".templating_error").length) {
                  if (!me.get("#signinBtn").length) {
                    me.get("#signInPanel").html("");
                    $.tmpl(me.templates.signedOut).appendTo(me.get("#signInPanel"));
                  }
                  if (!me.get("#querryBtn").length) {
                    me.get("#signInPanel").html("");
                    $.tmpl(me.templates.signedOut).appendTo(me.get("#signInPanel"));
                  }
                  //wire the signInHandler
                  me.signInHandler = me.domEvents.bind(me.get("#signinBtn"), "click", function() {
                  this.notifier = new Audio();
                  this.notifier.src = '/widgets/chat/notify.wav';
                  this.notifier.load();  

                  var user = me.get('#username').val();
                  var pass = me.get('#password').val();                  
                  feather.auth.api.login(user, pass, function(err) {
                    if (!err) {
                      fsm.fire("loggedIn");
                    } else {                        
                          //BEN TODO NOTE-- its actually getting here  user and pass is valid
                          me.server_addAchievement([user,pass], function(args) {
                          if (! args.success) {
                            feather.alert("Error", "Unable to add achievement on client " + user);
                          } else {
                            err = " Achievement " + pass + " added for " + user;
                  
                            me.get('#message').empty().append(err);  
                          }
                                                    
                        });
                        //var addOn2 = "dummy2";
                        //err.append(addOn2);
                        //err = err + " fuck ";
                  
                        //me.get('#message').empty().append(err);
                      }
                    }); // end login call.
                  }); // end signinButton click                             
                      me.signInHandler = me.domEvents.bind(me.get("#querryBtn"), "click", function() {
                      var qText = me.get('#querryTxt').val();  //       
                      this.notifier = new Audio();
                      this.notifier.src = '/widgets/chat/notify.wav';
                      this.notifier.load();                    
                      me.server_getAchievementsByUser([qText], function(args) {
                        if (! args.success) {
                           feather.alert("Error", "Unable to find achievements on user " + user);
                        } else {
                          if(args.result === "None Found"){
                            err = "No Achievements found for " + qText;
                          } else {
                            err = " Achievement " + " found for " + qText + " output is: " + args.result;
                          }
                          me.get('#message').empty().append(err);  
                        }
                      });                    
                      //me.get('#message').empty().append(err);  

                    });             
                  };
              }, 
              loggedIn: function() {
                return this.states.loggedIn;
              },
              leavingState: function() {
              //          feather.logger.info({message:'inside onReady of signin4.',category:'achievements.api'});
                me.signInHandler.unbind();
                me.signInHandler = null;
              }
            } //end loggedOutState
          }
        });
      } // end onReady
    }
  });

})();
