jQuery(document).ready( function() {

    window.clients = new ClientCollection;
    clients.fetch();
    clients.init_post_fetch(); // sets selected

    window.app = new App( { type: "signup" } );

    var args = decode_url_arguments();

    $('.dialog_head h2').text('Sign up');
    var client = clients.get_by_id(args.id);

    if (client.get('type') == 'remote') {
        $('#username').val( client.get('data').bt_user );
    } else {
        client.doreq( { action: 'getsettings' },
                      function(data, status, xhr) {
                          if (data && data.settings) {
                              for (var i=0; i<data.settings.length; i++) {
                                  if (data.settings[i][0] == 'webui.uconnect_username') {
                                      $('#username').val( data.settings[i][2] );
                                      break;
                                  }
                              }
                          }
                      },
                      function(xhr, status, text) {
                      }
                    );
    }


    function onerr(msg) {
        $('.progressbar_container').text(msg?msg:'Error. Try again');
    }
    function dostatus(msg) {
        $('.progressbar_container').text(msg);
    }


    function do_signup(evt) {
        var username = $('#username').val();
        var password = $('#password').val();
        if (! username) {
            dostatus('Enter a name');
            return;
        }
        if (! username) {
            dostatus('Enter password name');
            return;
        }

        var session = new falcon.session;
        dostatus('Checking username');
        debugger;
        session.check_username( username, {
            success: function(data, status, xhr) {
                // need to disable and then enable, I think...

                if (data.code == '/ok' && data.exists === false) {
                    client.set_settings( { 'webui.uconnect_username': username,
                                           'webui.uconnect_password': password },
                                         function() {
                                             debugger;
                                             client.set_settings( { 'webui.uconnect_enable': 0 },
                                                                  function() {
                                                                      debugger;
                                                                      client.set_settings( { 'webui.uconnect_enable': 1 },
                                                                                           function() {
                                                                                               debugger;
                                                                                               client.set('remote_username', username);
                                                                                               client.save();
                                                                                               dostatus('done!');
                                                                                               setTimeout( function() {
                                                                                                   app.broadcast( { message: 'reset' } );
                                                                                                   BTCloseFloatingWindow();
                                                                                               }, 200);
                                                                                           },
                                                                                           onerr
                                                                                         );
                                                                  },
                                                                  onerr );
                                         },
                                         onerr );

/*
                    client.doreq( 'action=setsetting&s=webui.uconnect_username&v=' + encodeURIComponent(username) +
                                  '&s=webui.uconnect_password&v=' + encodeURIComponent(password) +
                                  '&s=webui.uconnect_enable&v=1',
                                  function(data, status, xhr) {
                                      if (data && data.build) {
                                          dostatus('done!');
                                          BTCloseFloatingWindow();
                                          // good to go!
                                      } else {
                                          onerr(data);
                                      }
                                  },
                                  function(xhr, status, text) {
                                      debugger;
                                      onerr(text);
                                  });
*/
                } else {
                    onerr('username taken');
                }
            },
            error: function(xhr, status, text) {
                onerr('username taken');
            }
        });
    }

    $('#button_login').click( do_signup );
    $('#password').keydown( function(evt) {
        if (evt.keyCode == 13) {
            do_signup(evt);
        }
    });
    $('#username').keydown( function(evt) {
        if (evt.keyCode == 13) {
            do_signup(evt);
        }
    });
});
