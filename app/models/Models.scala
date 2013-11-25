package models

import java.sql.SQLException
import java.text.SimpleDateFormat
import java.util.Date
import org.joda.time.LocalDate
import play.api.Play.current
import play.api.db.slick.Config.driver.simple._
import play.api.libs.functional.syntax._
import play.api.libs.json._
import slick.lifted.{ Join, MappedTypeMapper }
import scala.slick.lifted.ForeignKeyAction

/**
 * Data Access Object trait used to create the DAOs
 */
private[models] trait DAO extends EmployeesComponent with DepartmentsComponent with MunicipalitiesComponent {
  val Employees = new Employees
  val Departments = new Departments
  val Municipalities = new Municipalities
}

/* Case class for municipalities */
case class Municipality(id: Option[Long], name: String)

/* Case class for departments */
case class Department(id: Option[Long], name: String) {
  def this(name: String) = this (None, name)
}

/* Case class for departments */
case class Employee(id: Option[Long] = None, firstName: String, lastName: String, email: String, contractBeginDate: Date, birthMunicipalityId: Long, departmentId: Long)

/* Components to ensapsulate tables */
trait MunicipalitiesComponent {
  val Municipalities: Municipalities

  /* Municipality table definition */
  class Municipalities extends Table[Municipality]("MUNICIPALITY") {
    def id = column[Long]("ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("NAME", O.NotNull)
    def * = id.? ~ name <> (Municipality.apply _, Municipality.unapply _)
    def autoInc = * returning id
  }
}

trait DepartmentsComponent {
  val Departments: Departments

  /* Department table definition */
  class Departments extends Table[Department]("DEPARTMENT") {
    def id = column[Long]("ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("NAME", O.NotNull)
    def * = id.? ~ name <> (Department.apply _, Department.unapply _)
    def autoInc = * returning id
  }
}

object Municipalities extends DAO {
  /* JSON writer for municipalities */
  implicit val municipalitiesWriter: Writes[(Municipality)] = (
    (__ \ "id").write[Option[Long]] ~
    (__ \ "name").write[String]
  ){(m: Municipality) => (m.id, m.name)}

  /* Municipalities just supports list, no modifications */
  def list(implicit s: Session): Seq[Municipality] = {
    (for {
      municipality <- Municipalities
    } yield municipality).sortBy(_.name).list
  }
}

object Departments extends DAO {
  /* JSON reader and writer for departments */
  implicit val departmentsReader: Reads[Department] =
    (__ \ "name").read[String].map
  {s => new Department(s)}

  implicit val departmentsWriter: Writes[(Department)] = (
    (__ \ "id").write[Option[Long]] ~
    (__ \ "name").write[String]
  ){(d: Department) => (d.id, d.name)}

  def list(implicit s: Session): Seq[Department] = {
    (for {
      department <- Departments
    } yield department).sortBy(_.name).list
  }

  /**
   * Insert a new department
   * @param department
   * @return Some ID of new department, or None
   */
  def insert(department: Department)(implicit s: Session): Option[Long] = {
    try {
      Some(Departments.autoInc.insert(Department(None, department.name)))
    } catch {
      case e: SQLException => None
    }
  }

  /**
   * Update an department
   * @param id Department ID to update
   * @param department Department data
   * @return Some ID of updated department, or None
   */
  def update(id: Long, department: Department)(implicit s: Session): Option[Long] = {
    val departmentToUpdate: Department = department.copy(Some(id))
    try {
      Some(Departments.where(_.id === id).update(departmentToUpdate))
    } catch {
      case e: SQLException => None
    }
  }

  /**
   * Delete an department
   * @param id ID of department to delete
   * @return True when succeeded, false otherwise
   */
  def delete(id: Long)(implicit s: Session): Boolean = {
    try {
      Departments.where(_.id === id).delete
      true
    } catch {
      case e: SQLException => false
    }
  }
}

/* Component to encapsulate Employees table, with dependent tables */
trait EmployeesComponent { self: MunicipalitiesComponent with DepartmentsComponent =>
  val Employees: Employees

  class Employees extends Table[Employee]("EMPLOYEE") {
    implicit val javaUtilDateTypeMapper = MappedTypeMapper.base[java.util.Date, java.sql.Date](
      x => new java.sql.Date(x.getTime), x => new java.util.Date(x.getTime)
    )

    def id = column[Long]("ID", O.PrimaryKey, O.AutoInc)
    def firstName = column[String]("FIRST_NAME", O.NotNull)
    def lastName = column[String]("LAST_NAME", O.NotNull)
    def email = column[String]("EMAIL", O.NotNull)
    def contractBeginDate = column[Date]("CONTRACT_BEGIN_DATE", O.NotNull)
    def birthMunicipalityId = column[Long]("BIRTH_MUNICIPALITY_ID", O.NotNull)
    def departmentId = column[Long]("DEPARTMENT_ID", O.NotNull)
    def birthMunicipalityFk = foreignKey("BIRTH_MUNICIPALITY_ID", birthMunicipalityId, Municipalities)(_.id, onDelete = ForeignKeyAction.Cascade)
    def departmentFk = foreignKey("DEPARTMENT_ID", departmentId, Departments)(_.id, onDelete = ForeignKeyAction.Cascade)

    def * = id.? ~ firstName ~ lastName ~ email ~ contractBeginDate ~ birthMunicipalityId ~ departmentId <> (Employee.apply _, Employee.unapply _)

    def autoInc = * returning id

    val byId = createFinderBy(_.id)
  }
}

object Employees extends DAO {
  /* JSON reader and writer for employees */
  implicit val employeesReader = new Reads[Employee] {
    val sdf = new SimpleDateFormat("yyyy-MM-dd")
    def reads(js: JsValue): JsResult[Employee] = {
      JsSuccess(Employee(
        (js \ "id").as[Option[Long]],
        (js \ "firstName").as[String],
        (js \ "lastName").as[String],
        (js \ "email").as[String],
        sdf.parse((js \ "contractBeginDate").as[String]),
        (js \ "birthMunicipalityId").as[Long],
        (js \ "departmentId").as[Long]
        )
      )
    }
  }

  implicit val employeesWriter: Writes[(Employee)] = (
    (__ \ "id").write[Option[Long]] ~
    (__ \ "firstName").write[String] ~
    (__ \ "lastName").write[String] ~
    (__ \ "email").write[String] ~
    (__ \ "contractBeginDate").write[LocalDate] ~
    (__ \ "departmentId").write[Long] ~
    (__ \ "birthMunicipalityId").write[Long]
  ){(e: Employee) => (e.id, e.firstName, e.lastName, e.email, new LocalDate(e.contractBeginDate), e.departmentId, e.birthMunicipalityId)}

  /**
   * Retrieve an employee from id
   * @param id ID of employee to retrieve
   */
  def findById(id: Long)(implicit s: Session): Option[Employee] =
    Employees.byId(id).firstOption

  /**
   * Count all employees
   */
  def count(implicit s: Session): Int =
    Query(Employees.length).first

  /**
   * Count employees by department
   * @param departmentId Department id to filter by
   */
  def count(departmentId: Long)(implicit s: Session): Int =
    Query(Employees.where(_.departmentId === departmentId).length).first

  /**
   * List all employees
   */
  def list()(implicit s: Session): Seq[Employee] = {
    (for {
      employee <- Employees
    } yield employee).list
  }

  /**
   * List employees by department
   * @param departmentId Department id to filter by
   */
  def list(departmentId: Long)(implicit s: Session): Seq[Employee] = {
    (for {
      employee <- Employees
      if employee.departmentId === departmentId
    } yield employee).list
  }

  /**
   * Insert a new employee
   * @param employee Employee to insert
   * @return ID of new employee, or None if insert failed
   */
  def insert(employee: Employee)(implicit s: Session): Option[Long] = {
    try {
      Some(Employees.autoInc.insert(Employee(None, employee.firstName, employee.lastName, employee.email, employee.contractBeginDate, employee.birthMunicipalityId, employee.departmentId)))
    } catch {
      case e: SQLException => None
    }
  }

  /**
   * Update an employee
   * @param id ID of employee to update
   * @param employee Employee data to update
   * @return Some ID of updated employee, or None if failed to update
   */
  def update(id: Long, employee: Employee)(implicit s: Session): Option[Long] = {
    val employeeToUpdate: Employee = employee.copy(Some(id))
    try {
      Some(Employees.where(_.id === id).update(employeeToUpdate))
    } catch {
      case e: SQLException => None
    }
  }

  /**
   * Delete an employee
   * @param id ID of employee to delete
   * @return True when succeeded, false otherwise
   */
  def delete(id: Long)(implicit s: Session): Boolean = {
    try {
      Employees.where(_.id === id).delete
      true
    } catch {
      case e: SQLException => false
    }
  }
}