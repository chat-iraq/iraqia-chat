<?php
require_once('php/config.php');
?>


<!doctype html>
<html lang="en" ng-app="myApp">
<head>
<?php require_once('php/header.php'); ?>

<script>
$(document).ready(function() {

  $('.tabs button').click(function(){
    switch_tabs($(this));
  });
 
  switch_tabs($('.defaulttab'));
 
});
function switch_tabs(obj)
{
  $('.tab-content').hide();
  $('.tabs button').removeClass("selected");
  var id = obj.attr("rel");
 
  $('#'+id).show();
  obj.addClass("selected");
}
</script>

</head>

<body>

  
  <div id="top">
    <div class="container">
      <div class="row">
        <div class="span12">
         
          <h1><a href="index.php" id="homelink"><?php print $site_name ?></a></h1>
          <p><?php print $site_slogan ?></p>
        </div>
      </div>
    </div>
  </div>

  <div class="container" ng-controller="projectorCtrl">

  




 

  <?php

  $url  = trim(urldecode($_GET['site'])); 
  $url0 = $url;
  print 'Loading seo report for: '. trim(htmlentities($url0,ENT_QUOTES));
  $site_headers = explode("\r\n",getHeaders($url));
  if(!empty($site_headers[0])){
  $httpcode = httpcodextractor($site_headers[0]);

  if($httpcode == 200 || $httpcode == 500 || $httpcode == 301 || $httpcode == 302 || $httpcode == 403){
    

     add_site($url,'php/' . $site_dbfile);
    print ' <font color="green">[Host up] </font><hr/>';
   

    #here the magic starts
    require_once('php/core.php'); 
    #and here it ends
   

    #and now let`s print the results

    
      //
      //host info printing
      //

      print '
      <div id="info_wrapper">
      <div class="info">
      <h1>Host information</h1>
      Adress: ' . $ip . ' | <a href="http://www.spamhaus.org/query/domain/'.clean_url($url0).'" target="_blank">Blacklist status</a> <br />
      Country: ' . $country . '<br />
      Region: ' . $region . '<br />
      Provider: ' . $isp . '<br />
      </div>
      ';

      //
      //domain info printing
      //

      print '
      <div class="info">
      <h1>Domain information</h1>
      Pagerank: ' . $pagerank . '<br/>
      Alexa rank: '. $alexa_rank .'<br/>
      WhoIs: <a href="http://whois.net/whois/'.clean_url(htmlentities($url0,ENT_QUOTES)).'" target="_blank">View Whois Information</a>
      <br/>
      </div>
      </div>
      <center>
      <h2>Seo report</h2>
      <div id="buttons">
      <ul class="tabs">
       <button href="#" class="defaulttab" rel="tabs1">Crawling status</button>
        <button href="#" rel="tabs2">Head elements check</button>
        <button href="#" rel="tabs3">Content check</button>
        <button href="#" rel="tabs4">Url strucure check</button>
        <button href="#" rel="tabs5">Links check</button>
      </div>
      </center>
      <hr/>
      <div id="results">
      ';

      //
      //crawling report printing
      //

      print '<div class="tab-content" id="tabs1"><h1>1.Crawling status</h1>
      <br />
      <span class="aqua">A)</span><span class="ginfo2"> HTTP RESPONSE</span>' . $msg_httpcode .
      '<br />
      <br />
      <div class="alert alert-block" style="padding: 8px 35px 8px 14px; background-color: rgb(252, 248, 227); border: 1px solid rgb(251, 238, 213); color: rgb(252, 248, 227);color:black;">
      ';

      foreach($site_headers as $header){
          if(trim($header) != ''){
             print $header . '<br />';
          }
      }

      print '</div>
      <div class="alert alert-info" style="padding: 8px 35px 8px 14px; background-color: rgb(217, 237, 247); border: 1px solid rgb(188, 232, 241); color: rgb(58, 135, 173);">
        <strong>Info & tips:</strong> 
        Http headers are used by robots and crawlers to understand your site structure. Ensure yourself your site is using corect headers. More informations on HTTP codes and headers at <a href="www.seomoz.org/learn-seo/http-status-codes">www.seomoz.org/learn-seo/http-status-codes</a> 
      </div>
      <br />
      <span class="aqua">B)</span><span class="ginfo2"> Robots.txt Check </span>' .  $msg_robots . '
      <br />
      <br />
      <div class="alert alert-info" style="padding: 8px 35px 8px 14px; background-color: rgb(217, 237, 247); border: 1px solid rgb(188, 232, 241); color: rgb(58, 135, 173);">
        <strong>Info & tips:</strong>
        The robots.txt file provides informations about wich directories are allowed to be crawled by spiders, crawlers and bots. You can find more informations on <a href="http://www.robotstxt.org/robotstxt.html">http://www.robotstxt.org/robotstxt.html</a>
      </div>
      <span class="aqua">C)</span><span class="ginfo2"> Sitemap Check </span>' .  $msg_sitemapcheck . '
      <br />
      <br />
      <div class="alert alert-info" style="padding: 8px 35px 8px 14px; background-color: rgb(217, 237, 247); border: 1px solid rgb(188, 232, 241); color: rgb(58, 135, 173);">
        <strong>Info & tips:</strong> 
        Sitemaps are used by search engines to "draw" a map of your site. This check may be a false positive. More informations on sitemaps at <a href="http://support.google.com/webmasters/bin/answer.py?hl=en&answer=183669">http://support.google.com/webmasters/bin/answer.py?hl=en&answer=183669</a>
      </div>
      </div>';

      //
      //head elements report printing
      //

      print '<div class="tab-content" id="tabs2">
      <h1>2. Head elements check</h1>
      <br />';

      //title

      print '<span class="aqua">A)</span><span class="ginfo2"> Title tag check</span>
      <br />
      <br />';
      print '<span class="ginfo">Title: </span>' . $msg_title . '<br />';
      print '<span class="ginfo">Lenght: </span> ' . $msg_titlelenght . '<br />';
      print '<span class="ginfo">Stop words:</span> ' . $msg_titlestopwords . '<br />';
      print '<span class="ginfo">Keyword(s) in title:</span> ' . $msg_kwintitle . '<br />';
      print '<span class="ginfo">Keyword relevance:</span> ' . $msg_kw2titlerel . '<br /><br />';
      print '<div class="alert alert-info" style="padding: 8px 35px 8px 14px; background-color: rgb(217, 237, 247); border: 1px solid rgb(188, 232, 241); color: rgb(58, 135, 173);">
        <strong>Info & tips:</strong> 
        The title tag is a very important seo resource. There is not a certain recipe for 100% title optimisation, but it`s recomended to have a title with the length between 40 and 65 characters, no <a href="http://www.link-assistant.com/seo-stop-words.html">stop words</a>, keywords in title, and a decent relevance between title and the keywords you are promoting and your content. More info: <a href="http://www.seomoz.org/learn-seo/title-tag">http://www.seomoz.org/learn-seo/title-tag</a>
      </div><br />';

      //keywords

      print '<span class="aqua">B)</span><span class="ginfo2"> Meta Keywords check</span><br/>';
      print '<span class="ginfo">Keywords: </span>' . $msg_metakeywords . '<br />';
      print '<span class="ginfo">Keywords count:</span> ' . $msg_keywordcountstats . '<br />';
      print '<span class="ginfo">Relevance with site:</span> '. $msg_metakeywordsrel . '<br /><br />';
      print '<div class="alert alert-info" style="padding: 8px 35px 8px 14px; background-color: rgb(217, 237, 247); border: 1px solid rgb(188, 232, 241); color: rgb(58, 135, 173);">
        <strong>Info & tips:</strong> 
        Altough the meta keywords are ignored by major search engines like google or bing for some years now, some seo experts claims that they still play a role in on page optimisation. It`s recomended to have a number of keywords between 5 and 9 and a decent relevance report. You can read more on meta keywords here: <a href="http://www.w3schools.com/tags/tag_meta.asp">http://www.w3schools.com/tags/tag_meta.asp</a>
      </div>';

      //description

      print '<span class="aqua">C)</span><span class="ginfo2"> Meta Description check</span><br/>';
      print '<span class="ginfo">Description:</span> ' . $msg_metadesctext . '<br/>';
      print '<span class="ginfo">Description lenght:</span> ' . $msg_descleng . '<br/>';
      print '<span class="ginfo">Keywords in description:</span> ' . $msg_metakwindesc . '<br/>';
      print '<span class="ginfo">Relevance with keywords:</span> ' . $msg_metadescrel . '<br/>';
      print '<div class="alert alert-info" style="padding: 8px 35px 8px 14px; background-color: rgb(217, 237, 247); border: 1px solid rgb(188, 232, 241); color: rgb(58, 135, 173);"><br />
        <strong>Info & tips:</strong> 
        Meta description tag is a usefull method to describe the content your page is hosting. Avoid having same descriptions on all your pages. A proper meta description has a lenght of 150/160 characters at max, a decent relevance with the keywords you want to promote your site with, and, ofcourse, keywords in the description. You can find more informations at:
        <a href="http://www.seomoz.org/learn-seo/meta-description">http://www.seomoz.org/learn-seo/meta-description</a>
      </div></div>';

      //
      //content report printing
      //

      print '<div class="tab-content" id="tabs3">
      <h1>3. Content check</h1>
      <br />';
      print '<span class="ginfo">Content characters count: </span>' . $contentlenght . '<br />';
      print '<span class="ginfo">Content words count: </span>' . $contentwords . '<br />';
      print '<span class="ginfo">Keywords present in content: </span>' . $kwincontent . '<br />';
      print '<span class="ginfo">Content relevance </span>' . $contentrelevance . '<br />';
      print '<span class="ginfo">Keyword(s) in italic: </span>' . $msg_contentitalics . '<br />';
      print '<span class="ginfo">Keyword(s) in bold: </span>' . $msg_contentbold . '<br />';
      print '<span class="ginfo">Headings check: </span>' . $msg_contentheadings . '<br />';
      print '<span class="ginfo">Iframes check: </span>' . $msg_contentframes . '<br /><br />'; 
      print '<div class="alert alert-info" style="padding: 8px 35px 8px 14px; background-color: rgb(217, 237, 247); border: 1px solid rgb(188, 232, 241); color: rgb(58, 135, 173);">
        <strong>Info & tips:</strong> 
        Site content is the most important thing in seo.The more unique your content is, the bigger chance you have to be indexed by search engines. There are a few things you have to keep in mind. Your content should be more than 300 characters long, or 50 words, it should have the keywords you are promoting in well formated senteces, it should have your keywords in &lt;i&gt;(italic) and &lt;b&gt;/&lt;strong&gt;(bold) tags(but not to much) and it should also contain &lt;h&gt; tags. Avoid using iframes, because the content is not indexed. More tips and tricks:<a href="http://www.seomoz.org/learn-seo/on-page-factors">http://www.seomoz.org/learn-seo/on-page-factors</a>
      </div>
      </div>';

      //
      //url structure report printing
      //

      print '<div class="tab-content" id="tabs4">
      <h1>4. Url structure check</h1>';
      print '<span class="ginfo">Domain: </span>' . $msg_urldomain . '<br />';
      print '<span class="ginfo">Keyword(s) in url: </span>'. $msg_kwinurl . '<br />';
      print '<span class="ginfo">Domain lenght: </span>' .$msg_urldomainlenght . '<br />';
      print '<span class="ginfo">Subdomains: </span>' . $msg_urlsubdomain . '<br /><br />';
      print '<div class="alert alert-info" style="padding: 8px 35px 8px 14px; background-color: rgb(217, 237, 247); border: 1px solid rgb(188, 232, 241); color: rgb(58, 135, 173);">
        <strong>Info & tips:</strong> 
       The domain is another important seo factor .You should pick easy to remember domain names, with no special characters and with a lenght no bigger than 76 chars. Search engines also consider that data hosted on subdomains is less important, so try to host your projects on domains, not subdomains. The TLD also matter, try to buy right TLDs, according to your site niche. More about domain name picking:<a href="http://www.seomoz.org/learn-seo/domain">http://www.seomoz.org/learn-seo/domain</a>
      </div>
      </div>';

      //
      //links report printing
      //

      print '<div class="tab-content" id="tabs5">
      <h1>5. Links check</h1>';
      print '<span class="ginfo">Internal links: </span>' .  $msg_internalinks . '<br />';
      print '<span class="ginfo">External links: </span>'.  $msg_externalinks . '<br /><br />';
      print '<div class="alert alert-info" style="padding: 8px 35px 8px 14px; background-color: rgb(217, 237, 247); border: 1px solid rgb(188, 232, 241); color: rgb(58, 135, 173);">
        <strong>Info & tips:</strong> 
        Through links, your site is getting crawled, so remember to check all the time for broken links. It`s also recomended to have no more than 100 internal links(links pointing to your site). Always use a proper title and anchor for your links. More on links optimisation here:<a href="http://www.seomoz.org/learn-seo/internal-link">http://www.seomoz.org/learn-seo/internal-link</a>
      </div>
      </div>
      </div>';

      //add_site($url);
   }
  else{
      print '<font color="red"> [Host down]</font>';
  }
  }
  else{
      print '<font color="red"> [Host down]</font>';
  }

  ?>
  </div>



<?php require_once('php/footer.php'); ?> 

</body>
</html>
