-- FUNCTION: public.GetPortfolioRealPerformanceById(integer)
-- In command line, to install function run: "psql -d <dbname> -a -f <filename>"
DROP FUNCTION IF EXISTS public.GetPortfolioRealPerformanceById(integer);

CREATE OR REPLACE FUNCTION public.GetPortfolioRealPerformanceById
(
    s_portfolioid INTEGER
)
RETURNS TABLE (
    date Date,
    value NUMERIC
)
AS
$$
BEGIN
	DROP TABLE IF EXISTS StockQuantity;
	CREATE TEMP TABLE StockQuantity (
    	date Date,
        ticker VARCHAR(8),
    	quantity BIGINT
    );

	INSERT INTO StockQuantity (date, ticker, quantity)
    SELECT
        date(T.datetime),
        T.ticker,
        Sum(T.quantity)
    FROM portfolios AS P
    INNER JOIN transactions AS T ON T.portfolioid = P.portfolioid
    WHERE P.portfolioid = s_portfolioid
      AND T.status = 1
    GROUP BY date(T.datetime), T.ticker;


    DROP TABLE IF EXISTS OutputTable;
	CREATE TEMP TABLE OutputTable (
        date Date,
        value NUMERIC
    );

    INSERT INTO OutputTable (date, value)
    SELECT
    	SQ.date,
        SUM(SQ.quantity * SL.price)
    FROM StockQuantity AS SQ
    LEFT OUTER JOIN stock_live AS SL ON SQ.ticker = SL.ticker
    WHERE SL.datetime = ( SELECT MAX(datetime) FROM stock_live AS SL2 WHERE SL2.ticker = SL.ticker )
    GROUP BY SQ.date;
    
    INSERT INTO OutputTable (date, value)
    SELECT
        date(T.datetime),
        Sum(T.quantity * T.price)
    FROM portfolios AS P
    INNER JOIN transactions AS T ON T.portfolioid = P.portfolioid
    WHERE P.portfolioid = s_portfolioid
      AND T.status = 1
      AND T.ticker = 'RESERVE'
    GROUP BY date(T.datetime);

    RETURN QUERY
    SELECT *
    FROM OutputTable;
    
END;
$$

LANGUAGE 'plpgsql'