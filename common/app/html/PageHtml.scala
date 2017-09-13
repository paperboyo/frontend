package html

import common.{Edition, Navigation}
import model.ApplicationContext
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.stackedFragments
import views.html.fragments._
import views.html.fragments.page.body._
import views.support.Commercial

trait PageHtml[P <: model.Page] {

  def html(implicit page: P, request: RequestHeader, applicationContext: ApplicationContext): Html

  def guardianHeaderHtml()(implicit page: P, request: RequestHeader, applicationContext: ApplicationContext): Html = {
    val showTop = !page.metadata.shouldHideHeaderAndTopAds
    val showAds = Commercial.shouldShowAds(page) && !model.Page.getContent(page).exists(_.tags.isTheMinuteArticle) && !Commercial.isAdFree(request)
    val headerContent: Seq[Html] =
      Seq.empty[Html] ++
        (if(showTop && showAds) Seq(commercial.topBanner()) else Nil) ++
        (if(showTop) Seq(header()) else Nil)

    if(model.Page.getContent(page).exists(_.tags.hasSuperStickyBanner)) {
      bannerAndHeaderDiv(headerContent: _*)
    }
    else {
      stackedFragments(headerContent)
    }
  }

  def defaultBodyClasses()(implicit page: P, request: RequestHeader, applicationContext: ApplicationContext) = {
    val edition = Edition(request)
    Map(
      ("has-page-skin", page.metadata.hasPageSkin(edition)),
      ("has-localnav", Navigation.topLevelItem(edition.navigation, page).filter(_.links.nonEmpty).nonEmpty),
      ("has-membership-access-requirement", page.metadata.requiresMembershipAccess),
      ("childrens-books-site", page.metadata.sectionId == "childrens-books-site"),
      ("has-super-sticky-banner", model.Page.getContent(page).exists(_.tags.hasSuperStickyBanner))
    )
  }


}
