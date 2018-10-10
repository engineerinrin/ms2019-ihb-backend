#!/bin/bash -e

function usage() {
  cat <<EOF

  1.使い方
    sh dev.sh 実行したいコマンド

  2.実行できるコマンド一覧
    build
      Dockerfileからイメージを作成する。
    run
      イメージからコンテナを作成する。
    start
      コンテナを起動する。
    stop
      コンテナを停止する。
    exec
      開発環境に入る。
      コンテナを起動している状態で利用できる。
      実行中にexitと入力すると開発環境から出る。
  
  3.exec実行中に(開発環境の中で)使える主なコマンド(yarn 〜)
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
  docker build -t ms2019-backend:local .
}

function run() {
  docker run -it -d -v ${PWD}:/app -p 3000:3000 --name ms2019-backend ms2019-backend:local
}

function start() {
  docker start ms2019-backend
}

function stop() {
  docker stop ms2019-backend
}

function execute() {
  docker exec -it ms2019-backend sh
}

if [ $# -eq 0 ];then
  usage
  exit 0
fi

case "${1}" in
  "build")
    build
  ;;
  "run")
    run
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
  *)
    echo "一致するコマンドがありません。使用できるコマンドは以下の通りです。"
    usage
    exit 1
esac
