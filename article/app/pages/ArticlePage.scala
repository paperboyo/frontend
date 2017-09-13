package pages

import html.{PageHtml, Styles}
import model.{ApplicationContext, PressedPage}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments._
import views.html.fragments.page._
import views.html.fragments.page.head._
import views.html.fragments.page.body._
import views.html.fragments.page.head.stylesheets._

object ArticlePage extends PageHtml[PressedPage] {

  def allStyles(implicit applicationContext: ApplicationContext) = new Styles {
    //TODO: get correct links
    override def criticalCss: Html = criticalStyles(Some("article"))
    override def linkCss: Html = stylesheetLink("stylesheets/article.css")
    override def oldIECriticalCss: Html = stylesheetLink("stylesheets/old-ie.head.article.css")
    override def oldIELinkCss: Html = stylesheetLink("stylesheets/old-ie.content.css")
    override def IE9LinkCss: Html = stylesheetLink("stylesheets/ie9.head.article.css")
    override def IE9CriticalCss: Html = stylesheetLink("stylesheets/ie9.content.css")
  }

  def html(implicit page: PressedPage, request: RequestHeader, applicationContext: ApplicationContext): Html = {
    htmlTag(
      headTag(
        titleTag(),
        metaData(),
        // article meta
        styles(allStyles),
        fixIEReferenceErrors(),
        inlineJSBlocking()
      ),
      bodyTag(classes = defaultBodyClasses)(
        message(),
        skipToMainContent(),
        pageSkin(),
        survey(),
        guardianHeaderHtml(),
        breakingNewsDiv(),
        //TODO: article body
        footer(),
        inlineJSNonBlocking(),
        analytics.base()
      ),
      devTakeShot()
    )
  }

}
