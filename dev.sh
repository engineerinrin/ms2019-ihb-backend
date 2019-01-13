#!/bin/bash -e

function usage() {
  cat <<EOF

  1.使い方
    sh dev.sh 実行したいコマンド

  2.実行できるコマンド一覧
    build
      必要なイメージを作成する。
    start
      コンテナをバックグラウンドで起動する。
      コンテナが未作成の場合は、作成する。
    stop
      コンテナを停止する。
    exec
      バックエンドの開発環境に入る。
      コンテナを起動している状態で利用できる。
      実行中にexitと入力すると開発環境から出る。
    dbinit
      データベースの構築やデータの挿入を行う。
    clean
      コンテナを全て破棄する。
  
  3.exec実行中に(開発環境の中で)使用する主なコマンド(yarn 〜)
    yarn dev
      開発を行う時に使用する。
      実行中はソースファイルの変更を自動で検知してリロードする。
      Ctrl + Cで終了できる。
    yarn build
      ソースファイルをビルドする。
      トランスパイルされたファイル(server.js)がdistフォルダに出力される。
    yarn start
      ビルドしたサーバーを実行する。
      Ctrl + Cで終了できる。
    yarn lint
      コーディングルールに違反する記述がないか調べる。
    yarn lint:fix-all
      コーディングルールに違反する記述を全て修正する。

EOF
}

function build() {
  docker-compose build
}

function start() {
  docker-compose up -d
}

function stop() {
  docker-compose stop
}

function execute() {
  docker exec -it ms2019-web sh
}

function dbinit() {
  seeds=(users reports report_comments prefs)
  for i in ${seeds[@]}
  do
    docker exec -it ms2019-db mongoimport --db ms2019 --collection $i --drop --jsonArray --maintainInsertionOrder --file ./seeds/$i.json
  done
}

function clean() {
  stop
  docker-compose rm -f
}

if [ $# -eq 0 ];then
  usage
  exit 0
fi

case "${1}" in
  "build")
    build
  ;;
  "start")
    start
  ;;
  "stop")
    stop
  ;;
  "exec")
    execute
  ;;
  "dbinit")
    dbinit
  ;;
  "clean")
    clean
  ;;
  *)
    echo "一致するコマンドがありません。使用できるコマンドは以下の通りです。"
    usage
    exit 1
esac
