feather.ns("blog");
(function() {
  
  blog.latestposts = feather.Widget.create({
    name : "blog.latestposts",
    path : "widgets/latestposts/",
    prototype : {
      onReady: function() {
        var me = this;
        feather.auth.api.on('authenticated', function() {
          me.checkUser();
        }, me); //pass disposable object to track disposal to clean up handlers (disposable objects are expected to fire a 'disposed' event)
        feather.auth.api.on('loggedOut', function() {
          me.checkUser();
        });
        this.bindUI();
      },
      bindUI: function() {
        var me = this;
        
        // Bind a click event to the headers to expand / collapse them.
        me.domEvents.bind(me.get(".blogentry h3"), "click", function(event) {
          var target = $(this); //note: 'this' inside jQuery .bind functions === the element that triggered the event
          if (target[0]) {
            var content = target.next('p');
            if (content.hasClass('collapsed')) {
              content.removeClass('collapsed');
              target.val('-');
            } else {
              content.addClass('collapsed');
              target.val('+');
            }
          }
        });

        // Bind a click event to the headers to expand / collapse them.
        me.domEvents.bind(me.get(".blogreply h5"), "click", function(event) {
          var target = $(this); //note: 'this' inside jQuery .bind functions === the element that triggered the event
          if (target[0]) {
            var content = target.next('p');
            if (content.hasClass('collapsed')) {
              content.removeClass('collapsed');
              target.val('-');
            } else {
              content.addClass('collapsed');
              target.val('+');
            }
          }
        });
      },
      refreshPosts: function() {
        var me = this;
        me.server_getPosts(function(args) {
          if (args.success) {
            me.domEvents.unbindAll(); //avoid memory leaks
            me.get("#list").html("");
            $.tmpl(me.templates.posts, {result: args.result}).appendTo(me.get("#list"));
            me.bindUI();
            me.checkUser();
          }
        });
      },
      checkUser: function() {
        var me = this;
        if (feather.auth.user && (feather.auth.user.hasAnyAuthority(['admin', 'editor']))) {
          $('.blogentry h3').prepend(function(index, html) {
            return '<input type="button" value="Reply"  parentid="' + $($('.blogentry h3')[index]).attr('postid') + '" level="1" class="btnEditPost"/>';
          });
          $('.blogentry h3').prepend(function(index, html) {
            return '<input type="button" value="Edit" postid="' + $($('.blogentry h3')[index]).attr('postid') + '" level="0" class="btnEditPost" />';
          });
          $('.blogreply h5').prepend(function(index, html) {
            return '<input type="button" value="Edit" postid="' + $($('.blogreply h5')[index]).attr('postid') + '" parentid="' + $($('.blogreply h5')[index]).attr('parentid') + '" level="1" class="btnEditPost" />';
          });
          me.domEvents.bind(me.get(".btnEditPost"), "click", function(event) {
            event.stopPropagation();
            var postId = $(this).attr('postid');
            var postParentId = $(this).attr('parentid');
            var postLevel = $(this).attr('level');
            var post = {
              id: postId,
              parent_id: postParentId,
              summary: me.get('#summary_'+postId).text(),
              post: me.get('#post_'+postId).text(),
              level: postLevel
            };
            me.fire("editPost", {post: post});
          });
        } else {
          me.get(".btnEditPost").remove();
        }
      }
    }
  });

})();
