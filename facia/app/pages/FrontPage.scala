package pages

import common.Edition
import html.{PageHtml, Styles}
import model.{ApplicationContext, PressedPage}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments._
import views.html.fragments.page._
import views.html.fragments.page.head._
import views.html.fragments.page.body._
import views.html.fragments.page.head.stylesheets._

object FrontPage extends PageHtml[PressedPage] {

  def cleanFrontBody()(implicit page: PressedPage, request: RequestHeader, context: ApplicationContext) = {
    import views.support.`package`.withJsoup
    import views.support.{BulletCleaner, CommercialComponentHigh, CommercialMPUForFronts}
    val html: Html = frontBody(page)
    val edition = Edition(request)
    withJsoup(BulletCleaner(html.toString))(
      CommercialComponentHigh(page.frontProperties.isPaidContent, page.isNetworkFront, page.metadata.hasPageSkin(edition)),
      CommercialMPUForFronts(page.isNetworkFront)
    )
  }

  def allStyles(implicit applicationContext: ApplicationContext) = new Styles {
    override def criticalCss: Html = criticalStyles(Some("facia"))
    override def linkCss: Html = stylesheetLink("stylesheets/facia.css")
    override def oldIECriticalCss: Html = stylesheetLink("stylesheets/old-ie.head.facia.css")
    override def oldIELinkCss: Html = stylesheetLink("stylesheets/old-ie.content.css")
    override def IE9LinkCss: Html = stylesheetLink("stylesheets/ie9.head.facia.css")
    override def IE9CriticalCss: Html = stylesheetLink("stylesheets/ie9.content.css")
  }

  def html(implicit page: PressedPage, request: RequestHeader, applicationContext: ApplicationContext): Html = {
    htmlTag(
      headTag(
        titleTag(),
        metaData(),
        frontMeta(),
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
        cleanFrontBody(),
        footer(),
        inlineJSNonBlocking(),
        analytics.base()
      ),
      devTakeShot()
    )
  }

}
