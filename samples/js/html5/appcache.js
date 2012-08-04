document.body.innerHTML = '<button onclick="new_reg()">new note</button>'+
  '<button onclick="drop_table()">drop table</button>'+
  '<button onclick="drop_db()">drop db </button>';
  
  var db;
  db = openDatabase("DBTest", "1.0", "HTML5 Database API example", 200000, function(db) {
    console.log('database opened');
  });
  
  db.transaction(function(tx) {
    tx.executeSql("SELECT COUNT(*) FROM Table1Test", [], function(result) {
      console.log('table Table1Test already existed. we skip any action.')
    }, 
    function(tx, error) {
      console.log('table Table1Test doesnt exist. Creating it')
      tx.executeSql("CREATE TABLE Table1Test (id REAL UNIQUE, note TEXT)", [], function(result) { 
        console.log('Table1Test created')
      },
      function(tx, error) {
        console.error('error creating Table1Test table');
        console.error(error)
      });
    });
  });
  
  
  function new_reg() {
    var num = Math.round(Math.random() * 10000);
    db.transaction(function(tx) {
      tx.executeSql("INSERT INTO Table1Test (id, note) VALUES (?, ?)", [num, (num * 2) + ''], function(tx) {
        console.log('register added')
      }, 
      function(tx, error) {
        console.error('error adding register')
        console.error(error)
      });
    });
  }


  function drop_table() {
    db.transaction(function(tx) {
      tx.executeSql("DROP TABLE Table1Test", [], function(tx) {
        console.log('Table1Test dropped')
      }, 
      function(tx, error) {
        console.error('error dropping Table1Test')
        console.error(error)
      });
    });
  }

  function drop_db() {
    db.transaction(function(tx) {
      tx.executeSql("DROP DATABASE DBTest", [], function(tx) {
        console.log('Database dropped')
      }, 
      function(tx, error) {
        console.error('error dropping Database')
        console.error(error)
      });
    });
  }
  
