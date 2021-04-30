<?php
require_once('php/config.php');
?>



<!doctype html>
<html lang="en" ng-app="myApp">
<head>
<?php require_once('php/header.php'); ?>
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

    <h1>Welcome to <?php print $site_name; ?></h1>
    <p>With our site,you can generate professional on page seo reports for you and/or your clients.We offer you statistics about crawling,head elements,content,links,domain,url structure and much more.
      You can also check your site against certain keywords,to see how relevant your site is.Using this service,you can win a lot of new users,improve site quality so much more.
      Fill the box below with a valid site,and with some keywords (if you want) separated by a comma.</p>
      <br />
      <div class="row">
<center>
  <div class="span12">
    <form method="get" action="analyser.php" class="form-inline" >
      <input name="site" class="span5" type="text"  placeholder="Site: http://example.com" >
      <input name="keywords" class="span5" type="text"  placeholder="Keywords: cheap liquor,free apps,funny movies">
      <button type="submit" class="btn btn-primary" style="margin-top:-5px;"> <i class="icon-search icon-white"></i></button>
    </form>
  </div>
</center>
</div>
   <h1>Sites analysed:</h1>
   <br />


   <?php
   $file = array_reverse(file('php/' . $site_dbfile));
   for($j=0;$j<3;$j++){
    print '<div class="latest">
    ';
     for($i=0;$i<5;$i++){
		$s_url = clean_url($file[$i]);
		if(strlen($s_url) > 16){
			$s_url = substr($s_url,0,16) . '...';
		}
        print '<span class="aqua"><a href="analyser.php?site='.clean_url($file[$i]).'" >'. $s_url .'</a></span><br />';
     }
     print '
     </div>';
     unset($file[0],$file[1],$file[2],$file[3],$file[4]);
     $file = array_values($file);
   }
   ?>

  
   <br />
   <br />
   <br />
   <br />
   <br />
   <br />
   

<center>
   <iframe src="//www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2Fplatform&amp;width=670&amp;height=258&amp;show_faces=true&amp;colorscheme=light&amp;stream=false&amp;border_color&amp;header=false" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:670px; height:258px;" allowTransparency="true"></iframe>
</center>
  </div>



<?php require_once('php/footer.php'); ?> 






</body>
</html>
