#!/bin/bash
USER=$1
TOKEN=$2
PR_NUM=$3
MSG=$4
REPO=$5
CURRENT_BRANCH_NAME=$6

comment(){

    COMMENT_TEXT="[**Webapp: ClientDemo **]($MSG/index.html)<table><TR><TD>![image](https://user-images.githubusercontent.com/1706296/28703438-ba525cc8-736c-11e7-918e-ec980b1a1e4f.png)<br />Team Reactive</TD><TD><br />**Travis-CI** <br />---------<br />Webapp Customization Website url for this branch click to preview the changes done on this branch. <br /><br />Branch name: **$CURRENT_BRANCH_NAME**<br /><br />[**Go - Webbapp Website: ClientDemo**]($MSG/index.html)</TD></TR></TABLE>"

    echo $COMMENT_TEXT
    curl -d '{"body":"'"$COMMENT_TEXT"'"}' -u "$USER:$TOKEN" -X POST https://api.github.com/repos/$REPO/issues/$PR_NUM/comments
    echo "done."
}

comment $USER $TOKEN $PR_NUM $MSG $REPO $CURRENT_BRANCH_NAME
