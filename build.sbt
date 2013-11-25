name := "play-demo"

version := "1.0-SNAPSHOT"

libraryDependencies ++= Seq(
  "com.typesafe.play" %% "play-slick" % "0.5.0.8",
  "mysql" % "mysql-connector-java" % "5.1.27",
  cache
)

play.Project.playScalaSettings

scalacOptions += "-feature"
