package controllers

import java.util.Date

import play.api._
import play.api.data._
import play.api.data.Forms._
import play.api.db.slick._
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.Logger
import play.api.mvc._
import play.api.Play.current

import models.{Department, Departments, Employee, Employees, Municipality, Municipalities}
import models.Departments.{departmentsReader, departmentsWriter}
import models.Employees.{employeesReader, employeesWriter}
import models.Municipalities.municipalitiesWriter

import scala.language.postfixOps

object Application extends Controller {

  /* Case class and form for capturing and validating submitted employee data. */
  case class EmployeeData(firstName: String, lastName: String, email: String, contractBeginDate: Date, birthMunicipalityId: Long, departmentId: Long)
  val employeeForm = Form(
    mapping(
      "firstName" -> nonEmptyText,
      "lastName" -> nonEmptyText,
      "email" -> email,
      "contractBeginDate" -> date(pattern = "YYYY-mm-dd"),
      "departmentId" -> longNumber(min = 1),
      "birthMunicipalityId" -> longNumber(min = 1)
    )(EmployeeData.apply)(EmployeeData.unapply)
  )

  /* Reader to convert submitted filter values to JSON */
  implicit val filterReads = (
    (__ \ "property").read[String] and
    (__ \ "value").read[Long]
  ) tupled

  /* Index page */
  def index = Action {
    Ok(views.html.index())
  }

  /* CRUD methods for employees */
  def insertEmployee = saveEmployee(None)
  def updateEmployee(id: Long) = saveEmployee(Some(id))
  def saveEmployee(id: Option[Long]) = DBAction(parse.json) { implicit request => // parse JSON body from request
    employeeForm.bindFromRequest.fold( // see if we can validate employee from submitted data
      formWithErrors => { BadRequest },
      employeeData => {
        val emp = Employee(None, employeeData.firstName, employeeData.lastName, employeeData.email, employeeData.contractBeginDate, employeeData.departmentId, employeeData.birthMunicipalityId)
        /* Perform an update or insert depending on submitted data */
        id match {
          case Some(itemId) if (itemId > 0) => {
            Employees.update(itemId, emp) match {
              case Some(s) => Ok(toJson(s))
              case _ => BadRequest
            }
          }
          case _ => {
            Employees.insert(emp) match {
              case Some(id) => Ok(toJson(id))
              case _ => BadRequest
            }
          }
        }
      }
    )
  }

  def deleteEmployee(id: Long) = DBAction { implicit rs =>
    if (Employees.delete(id))
      Ok(toJson(id))
    else
      BadRequest
  }

  def listEmployees = DBAction { implicit request =>
    val depIds = request.queryString.getOrElse("departmentId", Seq.empty[String])
    val depId = depIds.headOption map (_.toLong)
    /* Employees can be filtered by department */
    depId match {
      case Some(id) => seqToOk[Employee](Employees.list(id))
      case _ => seqToOk[Employee](Employees.list())
    }
  }

  /* CRUD methods for departments */
  def listDepartments = DBAction { implicit rs => seqToOk[Department](Departments.list)}
  def insertDepartment = saveDepartment(None)
  def updateDepartment(id: Long) = saveDepartment(Some(id))
  def saveDepartment(id: Option[Long]) = DBAction(parse.json) { implicit request => // parse JSON body from request
    request.body.validate[Department].fold( // validate that JSON contains valid data
      valid = (item => { // we now have a valid item
        /* Perform an update or insert depending on submitted data */
        id match {
          case Some(itemId) if (itemId > 0) => {
            Departments.update(itemId, item) match {
              case Some(s) => Ok(toJson(s))
              case _ => BadRequest
            }
          }
          case _ => {
            Departments.insert(item) match {
              case Some(id) => Ok(toJson(id))
              case _ => BadRequest
            }
          }
        }
      }),
      invalid = (_ => BadRequest) // valid item could not be parsed from request body
    )
  }

  def deleteDepartment(id: Long) = DBAction { implicit rs =>
    if(Departments.delete(id))
      Ok(toJson(id))
    else
      BadRequest
  }

  /* Method to list municipalities */
  def listMunicipalities() = DBAction { implicit rs => seqToOk[Municipality](Municipalities.list)}

  /* Utility function to convert sequence to JSON object with total count and array of records */
  private def seqToOk[A](xs: Seq[A])(implicit writer: Writes[A]) = {
    Ok(Json.obj(
      "total" -> xs.size,
      "records" -> (xs map(toJson(_))).toList
    ))
  }

}