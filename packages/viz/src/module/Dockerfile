FROM emscripten/emsdk:3.1.51 AS graphviz

ENV PREFIX=/prefix

ADD "https://github.com/libexpat/libexpat/releases/download/R_2_6_2/expat-2.6.2.tar.gz" ./expat.tar.gz

RUN mkdir -p expat && tar -zxf ./expat.tar.gz --strip-components 1 --directory expat
RUN cd expat && emconfigure ./configure --host=wasm32 --disable-shared --prefix="${PREFIX}" --libdir="${PREFIX}/lib" CFLAGS="-Oz" CXXFLAGS="-Oz"
RUN cd expat/lib && emmake make all install

ADD "https://gitlab.com/api/v4/projects/4207231/packages/generic/graphviz-releases/12.1.0/graphviz-12.1.0.tar.gz" ./graphviz.tar.gz

RUN mkdir -p graphviz && tar -zxf ./graphviz.tar.gz --strip-components 1 --directory graphviz
RUN cd graphviz && emconfigure ./configure --host=wasm32 --disable-ltdl --prefix="${PREFIX}" --libdir="${PREFIX}/lib" EXPAT_CFLAGS="-I${PREFIX}/include" EXPAT_LIBS="-L${PREFIX}/lib -lexpat" CFLAGS="-Oz" CXXFLAGS="-Oz"
RUN cd graphviz/lib && emmake make install
RUN cd graphviz/plugin && emmake make install


FROM emscripten/emsdk:3.1.51 AS viz

ARG DEBUG=""

ENV PREFIX=/prefix
ENV OUTPUT=/output

COPY --from=graphviz "${PREFIX}" "${PREFIX}"
COPY viz.c pre.js .

RUN mkdir -p "${OUTPUT}"
RUN emcc -Oz ${DEBUG:+-g2} --closure=0 --no-entry -sMODULARIZE=1 -sMINIMAL_RUNTIME=1 -sASSERTIONS=0 -sALLOW_MEMORY_GROWTH=1 -sENVIRONMENT=web -sEXPORT_KEEPALIVE=1 -sEXPORTED_FUNCTIONS="['_malloc', '_free']" -s EXPORTED_RUNTIME_METHODS="['ccall', 'UTF8ToString', 'lengthBytesUTF8', 'stringToUTF8', 'getValue', 'FS', 'PATH']" -sINCOMING_MODULE_JS_API="['wasm']" -sWASM_BIGINT=1 --pre-js pre.js -o "${OUTPUT}/module.mjs" viz.c -I"${PREFIX}/include" -I"${PREFIX}/include/graphviz" -L"${PREFIX}/lib" -L"${PREFIX}/lib/graphviz" -lgvplugin_dot_layout -lgvplugin_neato_layout -lgvplugin_core -lgvc -lpathplan -lcgraph -lxdot -lcdt -lexpat


FROM scratch AS export

ENV OUTPUT=/output

COPY --from=viz "${OUTPUT}" /
