# static-site-container
Sometimes there are multiple static sites for testing or internal using. 
But we don't want to deploy multiple nodejs instances. 
So the static-site-cotnainer will help to handle this.

## Install
```
$npm install static-site-container -g
```

## Usage
```
$static-site-container --root /multiple-sites-root --port 80
 
```

multiple site folder structure:
```
multiple-sites-root/
    sites/
        www.abc.com/
            public/
                index.htm
                ...
        www.xyz.com/
            public/
                index.html
                ...
            
```

## Site Config File

static-site-container will read config file named site-config.json under site folder.  

**Example**
```
 {
    "public": "public",
    "domains": ["www.abc.com","abc.com"],
    "port": 80
}

```


## License

MIT © [Yang Chen](https://github.com/etechi)
