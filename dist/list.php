
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>

<style>
    * {
        font-size: 14px;
        font-family: 'verdana'
    }
</style>

<h3>list file</h3>

<ul>

    <?php foreach(scandir(__DIR__) as $value): ?>
    
        <? if(substr($value, -4, 4) == 'html' ): ?>

        <li>
            <a href="/<?=$value?>" target="_blank"><?=$value?></a>
        </li>

        <? endif; ?>

    <?php endforeach ?>

</ul>
</body>
</html>