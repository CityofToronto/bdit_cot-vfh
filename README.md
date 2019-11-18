# bdit_cot-vfh
Visualization page for VFH to be used in the COT website. Michelle DaCruz, Senior Digital Content Advisor, Digital Communications, recommends linking the page to these locations on the COT website:  

```
The home of the new page which houses the data should be a child of the Big Data Innovation Team page.  
The content of the first accordion should be revised to link to this new page.  
I would also suggest adding a highlight on the Big Data page that links to this new page as well.
Here's an example of a highlight: [Road Safety](https://www.toronto.ca/services-payments/streets-parking-transportation/road-safety/).
It would contain a link with one to two sentences describing the new page.  

Other areas of toronto.ca which should link to the new page within related information are:
* Bylaw enforcement content: [Private Transportation Companies (Uber/Lyft) Bylaw](https://www.toronto.ca/city-government/public-notices-bylaws/bylaw-enforcement/private-transportation-company-drivers/)
* Road Safety content: [10 Things You Should Know About Taxis & Private Transportation Companies in Toronto](https://www.toronto.ca/services-payments/streets-parking-transportation/road-safety/passenger-safety-for-taxis-and-private-transportation-companies/)
* Permits & Licences content: [Private Transportation Companies (Uber/Lyft) & Drivers](https://www.toronto.ca/services-payments/permits-licences-bylaws/private-transportation-companies-uberfacedrive-drivers/) (should also be linked from two child pages within this section)
* [Research & Reports](https://www.toronto.ca/city-government/data-research-maps/research-reports/) content: It could also be added within Data, Research & Maps, though there are currently no transportation related items in this section.
```

**Mockup on EC2**  
See the [current mockup](https://10.160.2.198/vfh-cot/) for reference.  

**Ward Profiles on Heroku**  
Also see the [Ward Profiles](https://10.160.2.198/vfh-cot/) `dash` app currently hosted on Heroku.  

## Build instructions
From [COT documentation](https://itdconfluence.csd.toronto.ca/display/DTSKS/CotJS+Documentation).  

### 1. Clone corejs to your local machine:  

`cd /path_to/some_working_directory && git clone https://github.com/CityofToronto/corejs.git`  

Go into the new corejs directory and install the core npm packages:  

`cd corejs && npm install`  

### 2. Update node packages
Open your terminal and go into your local copy of corejs:  

`cd /path_to/where_you_keep_/corejs`  

Switch to the `master` branch, pull the latest changes, and update the node packages:  

`git checkout master && git pull && npm update`  

### 3. Scaffold a new embedded or standalone project  
While in the corejs directory, scaffold a new embedded or standalone project:  

Embedded app: `gulp scaffold -dir ../name_of_new_app --bare --embedded`  

Standalone app: `gulp scaffold -dir ../name_of_new_app --bare --standalone`  

Embedded apps are public-facing with the proper COT styles, whereas standalone apps are internal and therefore have different css stylings (e.g. green banner, blue text headings).  

This app here is **embedded**.  

### 4. Install the node and bower packages from project directory:

`cd ../name_of_new_app && npm install`  

### 5. Build and run
At this point, you should be able to use gulp tasks to build and run your project:

`gulp run`  

#### File resources in the code
Important! You need to place all file resources in the correct respective directories.  

**1. Add resource directories to the gulpfile**    
For resource directories like `lib`, `data`, etc., you need to explictly add them to `gulpfile.js`:  

```
const dir = '/resources';

gulp.task('lib', () => {
  return gulp.src(['src/lib/**/*'])
    .pipe(gulp.dest('dist' + dir + '/lib'));
});

gulp.task('i18n', () => {
  return gulp.src(['src/i18n/*.json'])
    .pipe(gulp.dest('dist' + dir + '/i18n'));
});

gulp.task('settings', () => {
  return gulp.src(['src/scripts/settings*.js'])
    .pipe(gulp.dest('dist' + dir + '/scripts'));
});

gulp.task('data', () => {
  return gulp.src(['src/data/*.json'])
    .pipe(gulp.dest('dist' + dir + '/data'));
});

gulp.task('build', ['_html_styles_scripts', '_images', '_fonts', '_extras', '_bower_extras', '_data', 'lib', 'i18n', 'settings', 'data']);
```

**2. Call files from correct directory in html file**  
a) In `app.html`, define the `css` files. File `main.css` is generated on build from `src/styles/main.scss` which is initially empty -- this is where you put your own specific css stylings for the app.    
```
<!-- cot-app:head -->
  <!--@exec startBuildTagWithCacheBuster('styles/main.css')-->
    <!-- core:css -->
    <!-- endinject -->
    <!-- place your application stylesheet references here: -->
    <link rel="stylesheet" href="<!-- @echo SRC_PATH -->/styles/main.css">
  <!-- endbuild -->
  <!--@exec startBuildTagWithCacheBuster('styles/core_print.css', 'media="print"')-->
    <!-- core_print:css -->
    <!-- endinject -->
    <!-- place any application print-only stylesheet references here -->
  <!-- endbuild -->
  <!--@if ENV=='local'-->
  <script type="text/javascript" src="/resources/cdn/cotui/cotui.js"></script>
  <link rel="stylesheet" type="text/css" href="/resources/cdn/cotui/cotui.css">
<!--@endif-->
<!-- cot-app:head end-->
```  

NB: Do not call `main.css` with `<link rel="stylesheet" type="text/css" href="</resources/styles/main.css">`; use the `@echo SRC_PATH` as above.  

b) Also define all the JS resources at the bottom of  `app.html`:  

```
<!-- cot-app:footer -->
  <!--@exec startBuildTagWithCacheBuster('scripts/main.js')-->
    <!-- core:js -->
    <!-- endinject -->
    <!-- place your application script references here: -->
    <script type="text/javascript" src="<!-- @echo SRC_PATH -->/scripts/main.js"></script>
  <!-- endbuild -->
  <script type="text/javascript" src="/resources/lib/jquery.min.js"></script>
  <script type="text/javascript" src="/resources/lib/i18next.min.js"></script>
  <script type="text/javascript" src="/resources/lib/bootstrap.min.js"></script>
  <script type="text/javascript" src="/resources/lib/d3.v4.min.js"></script>
  <script type="text/javascript" src="/resources/lib/queue.v1.min.js"></script>
  <script type="text/javascript" src="/resources/lib/utils.js"></script>
  <script type="text/javascript" src="/resources/lib/line.js"></script>
  <script type="text/javascript" src="/resources/lib/aux.js"></script>
  <!--@if ENV!='prod'-->
  <script type="text/javascript">
  </script>
  <!--@endif-->
<!-- cot-app:footer end-->
```  

**3. Call files from correct directory in main JS script**  
The main JS script is `src/scripts/main.js` which is generated by the build. It contains only a small structure and you need to add your code to it. Load `i18n` and the data files in the `$(document).ready` function from their respective `/resources/` directory:      

```
$(document).ready(function(){
  // -----------------------------------------------------------------------------
  // Initial page load
  i18n.load(["/resources/i18n"], () => {
    d3.queue()
      .defer(d3.json, "/resources/data/data.json")
      .await(function(error, datafile) {
        data = datafile;
    });
  })
})
```  

## Setup COT_UI
Needed for COT widgets (e.g. maps, charts).  

```
cd ./your-project-path
npm install https://github.com/CityofToronto/COT_UI.git#2.2.1
npm install cotui --save
```

## Map setup
For maps **other than choropleth** maps, see [COT documentation](https://itdconfluence.csd.toronto.ca/display/DTSKS/Cot+Map). Uses function `cot_map` in `cot_map.js` that gets built into `main.js` with `gulp`. Specifically, in `package.json`, turn `includeMap` to true:  

```
includeMap: true
```

The `cot_map` is not yet part of COTUI, but you can check out this example to make sure your `cot_map` complies with accessibility standards:  

https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/hot-weather/cool-spaces-near-you/#location=&lat=43.716527&lng=-79.371414  

For **choropleth** maps, use the map chart in described in the [COTUI widgets page](https://github.com/CityofToronto/COT_UI). See the Examples [here](http://cityoftoronto.github.io/COT_UI).

To get the map working (whichever version you use), add the following to `app.html`:  
```
<script type="text/javascript" src="<!-- @echo SRC_PATH -->/lib/cotui.js"></script>
<!-- Load Esri Leaflet from CDN https://github.com/Esri/esri-leaflet/issues/1113 -->
<script src="https://unpkg.com/esri-leaflet@2.0.7"></script>
```
