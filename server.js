const mysql = require("mysql2");
const inquirer = require("inquirer");
const figlet = require("figlet");
require("dotenv").config();
require("console.table");

const mysqlConnect = mysql.createConnection({
  host: "localhost",
  port: process.env.PORT || 3306,
  user: "root",
  dialect: "mysql",
  password: process.env.DB_PW,
  database: "emp_DB",
});

mysqlConnect.connect((err) => {
  if (err) throw err;

  figlet("Employee tracker", function (err, data) {
    if (err) {
      console.log("");
    } else {
      console.log(data);
    }

    startPrompt();
  });
});

function startPrompt() {
  const startQuestion = [
    {
      type: "list",
      name: "action",
      message: "Where do we start?",
      loop: false,
      choices: [
        "View All Employees",
        "View All Roles",
        "View All Departments",
        "View Employees by manager",
        "Add Employee",
        "Add Department",
        "Add Role",
        "Update Employee Role",
        "Update Employee Manager",
        "Delete an Employee",
        "View Total Budget of a Department",
        "Exit",
      ],
    },
  ];


  inquirer
    .prompt(startQuestion)
    .then((response) => {
      switch (response.action) {
        case "View All Employees":
          viewAll("employees");
          break;
        case "View All Roles":
          viewAll("roles");
          break;
        case "View All Departments":
          viewAll("departments");
          break;
        case "View Employees by manager":
          viewEmployeeByManager();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Add Role":
          addRole();
          break;
        case "Update Employee Role":
          updateemployeeRole();
          break;
        case "Update Employee Manager":
          updateManager();
          break;
        case "Delete an Employee":
          deleteEmployee();
          break;
        case "View Total Budget of a Department":
          viewBudget();
          break;
        default:
        case "Goodbye!":
          connection.end();
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

const viewAll = (table) => {
  let query;
  if (table === "departments") {
    console.log("VIEWING DEPARTMENTS\n");

    query = `SELECT * FROM DEPARTMENT`;
  } else if (table === "roles") {
    console.log("VIEWING ROLES\n");
    query = `SELECT * FROM ROLE`;
  } else {
   
    console.log("VIEWING EMPLOYEES\n");

    query = `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
          FROM employee e
          LEFT JOIN role r
            ON e.role_id = r.id
          LEFT JOIN department d
          ON d.id = r.department_id
          LEFT JOIN employee m
            ON m.id = e.manager_id`;
  }
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);

    startPrompt();
  });
};

const viewEmployeeByManager = () => {
 
  connection.query("SELECT * FROM EMPLOYEE", (err, emplRes) => {
    if (err) throw err;
    const employeeChoice = [
      {
        name: "NULL",
        value: 0,
      },
    ];
    emplRes.forEach(({ first_name, last_name, id }) => {
      employeeChoice.push({
        name: first_name + " " + last_name,
        value: id,
      });
    });
    let questions = [
      {
        type: "list",
        name: "manager_id",
        choices: employeeChoice,
        message: "What manager's employees do you want to see?",
      },
    ];
    inquirer
      .prompt(questions)
      .then((response) => {
        let manager_id, query;
        if (response.manager_id) {
          query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, 
                R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
                FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
                LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
                LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id
                WHERE E.manager_id = ?;`;
        } else {
          manager_id = null;
          query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, 
                R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
                FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
                LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
                LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id
                WHERE E.manager_id is null;`;
        }
        connection.query(query, [response.manager_id], (err, res) => {
          if (err) throw err;
          if (res != "") {
            console.table(res);
          } else {
            console.log("This employee is not a manager");
          }
          startPrompt();
        });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};

const addEmployee = () => {

  connection.query("SELECT * FROM EMPLOYEE", (err, employeeRes) => {
    if (err) throw err;
    
    const employeeChoice = [
      {
        name: "NULL",
        value: 0,
      },
    ];

    
    employeeRes.forEach(({ first_name, last_name, id }) => {
      employeeChoice.push({
        name: first_name + " " + last_name,
        value: id,
      });
    });

   
    connection.query("SELECT * FROM ROLE", (err, roleRes) => {
      if (err) throw err;

    
      const roleChoice = [];
      roleRes.forEach(({ title, id }) => {
        roleChoice.push({
          name: title,
          value: id,
        });
      });

    

      let questions = [
        {
          type: "input",
          name: "first_name",
          message: "First name?",
        },
        {
          type: "input",
          name: "last_name",
          message: "Last name?",
        },
        {
          type: "list",
          name: "role_id",
          choices: roleChoice,
          message: "Employee's role?",
        },
        {
          type: "list",
          name: "manager_id",
          choices: employeeChoice,
          message: "Who is the employee's manager?",
        },
      ];

      inquirer
        .prompt(questions)
        .then((response) => {
          const query = `INSERT INTO EMPLOYEE (first_name, last_name, role_id, manager_id) VALUES (?)`;
          let manager_id =
            response.manager_id !== 0 ? response.manager_id : null;
          connection.query(
            query,
            [
              [
                response.first_name,
                response.last_name,
                response.role_id,
                manager_id,
              ],
            ],
            (err, res) => {
              if (err) throw err;
              console.log(
                `Employee ${response.first_name} ${response.last_name} with ID ${res.insertId} has been inserted!`
              );
              startPrompt();
            }
          );
        })
        .catch((err) => {
          console.error(err);
        });
    });
  });
};


const addRole = () => {

  const departments = [];

  connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
    if (err) throw err;

    res.forEach((dep) => {
     
      let qObj = {
        name: dep.name,
        value: dep.id,
      };
      departments.push(qObj);
    });

   
    let questions = [
      {
        type: "input",
        name: "title",
        message: "Title of the new role?",
      },
      
      {
        type: "list",
        name: "department",
        choices: departments,
        message: "Department is this role in?",
      },
    ];
  

    inquirer
      .prompt(questions)
      .then((response) => {
        const query = `INSERT INTO ROLE (title, salary, department_id) VALUES (?)`;
        connection.query(
          query,
          [[response.title, response.salary, response.department]],
          (err, res) => {
            if (err) throw err;
            console.log(
              `Insert ${response.title} role at ID ${res.insertId}`
            );
            startPrompt();
          }
        );
      })
      .catch((err) => {
        console.error(err);
      });
  });
};


const updateemployeeRole = () => {
  
  connection.query("SELECT * FROM EMPLOYEE", (err, emplRes) => {
    if (err) throw err;
  
    const employeeChoice = [];
    emplRes.forEach(({ first_name, last_name, id }) => {
      employeeChoice.push({
        name: first_name + " " + last_name,
        value: id,
      });
    });

    
    connection.query("SELECT * FROM ROLE", (err, rolRes) => {
      if (err) throw err;
      
      const roleChoice = [];
      rolRes.forEach(({ title, id }) => {
        roleChoice.push({
          name: title,
          value: id,
        });
      });

     

      let questions = [
        {
          type: "list",
          name: "id",
          choices: employeeChoice,
          message: "Which employee's role do you want to update?",
        },
        {
          type: "list",
          name: "role_id",
          choices: roleChoice,
          message: "Whay will be the employee's new role?",
        },
      ];
    
      inquirer
        .prompt(questions)
        .then((response) => {
          const query = `UPDATE EMPLOYEE SET ? WHERE ?? = ?;`;
          connection.query(
            query,
            [{ role_id: response.role_id }, "id", response.id],
            (err) => {
              if (err) throw err;

              console.log(
                "Succesfully update employee's role!"
              );
              startPrompt();
            }
          );
        })
        .catch((err) => {
          console.error(err);
        });
    });
  });
};


const updateManager = () => {
 
  connection.query("SELECT * FROM EMPLOYEE", (err, emplRes) => {
    if (err) throw err;

    const employeeChoice = [];
    emplRes.forEach(({ first_name, last_name, id }) => {
      employeeChoice.push({
        name: first_name + " " + last_name,
        value: id,
      });
    });
   

    const managerChoice = [
      {
        name: "NULL",
        value: 0,
      },
    ];
    emplRes.forEach(({ first_name, last_name, id }) => {
      managerChoice.push({
        name: first_name + " " + last_name,
        value: id,
      });
    });
 

    let questions = [
      {
        type: "list",
        name: "id",
        choices: employeeChoice,
        message: "Who's manager needs updating?",
      },
      {
        type: "list",
        name: "manager_id",
        choices: managerChoice,
        message: "Who is their new manager?",
      },
    ];

    inquirer
      .prompt(questions)
      .then((response) => {
        const query = `UPDATE EMPLOYEE SET ? WHERE id = ?;`;
        let manager_id = response.manager_id !== 0 ? response.manager_id : null;
        connection.query(
          query,
          [{ manager_id: manager_id }, response.id],
          (err, res) => {
            if (err) throw err;

            console.log("Manager has been updated!");
            startPrompt();
          }
        );
      })
      .catch((err) => {
        console.error(err);
      });
  });
};



const deleteEmployee = () => {
  connection.query("SELECT * FROM EMPLOYEE", (err, res) => {
    if (err) throw err;
   
    const employeeChoice = [];
    res.forEach(({ first_name, last_name, id }) => {
  
      employeeChoice.push({
        name: first_name + " " + last_name,
        value: id,
      });
    });
    // Questions for employee to delete

    let questions = [
      {
        type: "list",
        name: "id",
        choices: employeeChoice,
        message: "which employee would you like to delete?",
      },
    ];

    // Show questions

    inquirer
      .prompt(questions)
      .then((response) => {
        const query = `DELETE FROM EMPLOYEE WHERE id = ?`;
        connection.query(query, [response.id], (err, res) => {
          if (err) throw err;
          console.log(
            `${res.affectedRows} has been deleted!`
          );
          startPrompt();
        });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};


const viewBudget = () => {

  connection.query("SELECT * FROM DEPARTMENT", (err, res) => {
    if (err) throw err;
    
    const depChoice = [];
    res.forEach(({ name, id }) => {
      
      depChoice.push({
        name: name,
        value: id,
      });
    });

    
    let questions = [
      {
        type: "list",
        name: "id",
        choices: depChoice,
        message: "Which department's budget?",
      },
    ];
    
    inquirer
      .prompt(questions)
      .then((response) => {
        const query = `SELECT D.name, SUM(salary) AS budget FROM
            EMPLOYEE AS E LEFT JOIN ROLE AS R
            ON E.role_id = R.id
            LEFT JOIN DEPARTMENT AS D
            ON R.department_id = D.id
            WHERE D.id = ?
            `;
        connection.query(query, [response.id], (err, res) => {
          if (err) throw err;
          console.table(res);
          startPrompt();
        });
      })
      .catch((err) => {
        console.error(err);
      });
  });
};
