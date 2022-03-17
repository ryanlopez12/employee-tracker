INSERT INTO department (name)
VALUES ("Tech"),
        ("Developer"),
        ("Marketing"),
        ("Production"),
        ("Writer");

SELECT * FROM department;

INSERT INTO role (title, salary, department_id)
VALUES ("Gaming guru", 120000, 1),
        ("Lead Designer", 140000, 1),
        ("Cryptomaster", 150000, 1),
        ("Accountant", 125000, 2),
        ("Account Manager", 160000, 2),
        ("Marketing Manager", 50000, 3),
        ("Internet Sleuth", 140000, 3),
        ("Retail Lead", 85000, 4),
        ("Sales", 80000, 4),
        ("Council Leader", 250000, 5),
        ("Lawyer", 190000, 5);

SELECT * FROM role;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Billy", "Bob", 9, NULL),
    ("John", "Smith", 3, NULL),
    ("Jim", "Halper", 1, 2),
    ("Tupac", "Shakur", 5, NULL),
    ("Christopher", "Wallace", 4, 4),
    ("Willy", "Wonka", 10, NULL),
    ("Tiny", "Tim", 11, 6);


SELECT * FROM employee;
